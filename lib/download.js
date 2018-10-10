'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');
const ejs = require('ejs');
const mkdirp = require('mkdirp');
const _ = require('lodash');
const Queue = require('queue');
const Entities = require('html-entities').AllHtmlEntities;
const FrontMatter = require('hexo-front-matter');
const out = require('./out');
const YuqueClient = require('./yuque');
const moment = require('moment');

const entities = new Entities();
const cwd = process.cwd();

// 需要提取的文章属性字段
const PICK_PROPERTY = [
  'title',
  'description',
  'created_at',
  'updated_at',
  'published_at',
  'format',
  'slug',
  'last_editor',
];

// 文章模板
const template = `
title: <%= title %>
date: <%= date %>
tags: <%= tags %>
categories: <%= categories %>
---
<%- raw %>
`;

/**
 * Constructor 下载器
 *
 * @prop {Object} client 语雀 client
 * @prop {Object} yuqueConfig 知识库配置
 * @prop {String} yuquePath 下载的文章缓存的 JSON 文件
 * @prop {String} postBasicPath 下载的文章最终生成 markdown 的目录
 * @prop {Array} _cachedArticles 文章列表
 *
 */
class Downloader {
  constructor(yuqueConfig, yuquePath) {
    this.client = new YuqueClient(yuqueConfig);
    this.yuqueConfig = yuqueConfig;
    this.yuquePath = yuquePath;
    this.postBasicPath = path.join(cwd, yuqueConfig.postPath || 'source/_posts/yuque');
    this._cachedArticles = [];
    this.fetchArticle = this.fetchArticle.bind(this);
    this.generatePost = this.generatePost.bind(this);
  }

  /**
   * 下载文章详情
   *
   * @param {Object} item 文章概要
   * @param {Number} index 所在缓存数组的下标
   *
   * @return {Promise} data
   */
  fetchArticle(item, index) {
    const { client, _cachedArticles } = this;
    return function() {
      out.info(`download article body: ${item.title}`);
      return client.getArticle(item.slug)
        .then(({ data: article }) => {
          const sourceArticle = _cachedArticles[index];
          // matter 解析
          const parseRet = parseMatter(article.body);
          const newArticle = _.merge(sourceArticle, parseRet || {});
          _cachedArticles[index] = newArticle;
        });
    };
  }

  /**
   * 下载所有文章
   * 并根据文章是否有更新来决定是否需要重新下载文章详情
   *
   * @return {Promise} queue
   */
  async fetchArticles() {
    const { client, _cachedArticles } = this;
    const articles = await client.getArticles();
    const realArticles = articles.data.map(article => _.pick(article, PICK_PROPERTY));
    const queue = new Queue({ concurrency: 5 });

    let article;
    let cacheIndex;
    let cacheArticle;
    let cacheAvaliable;

    const findIndexFn = function(item) {
      return item.slug === article.slug;
    };

    for (let i = 0; i < realArticles.length; i++) {
      article = realArticles[i];
      cacheIndex = _cachedArticles.findIndex(findIndexFn);
      if (cacheIndex < 0) {
        // 未命中缓存，新增一条
        cacheIndex = _cachedArticles.length;
        _cachedArticles.push(article);
        queue.push(this.fetchArticle(article, cacheIndex));
      } else {
        cacheArticle = _cachedArticles[cacheIndex];
        cacheAvaliable = +new Date(article.updated_at) === +new Date(cacheArticle.updated_at);
        // 文章有变更，更新缓存
        if (!cacheAvaliable) {
          queue.push(this.fetchArticle(article, cacheIndex));
        }
      }
    }

    return new Promise((resolve, reject) => {
      queue.start(function(err) {
        if (err) return reject(err);
        out.info('download articls done!');
        resolve();
      });
    });
  }

  /**
   * 读取语雀的文章缓存 json 文件
   */
  readYuqueCache() {
    const { yuquePath } = this;
    out.info(`reading from local file: ${yuquePath}`);
    try {
      const articles = require(yuquePath);
      if (Array.isArray(articles)) {
        this._cachedArticles = articles;
        return;
      }
    } catch (error) {
      // Do noting
    }
    this._cachedArticles = [];
  }

  /**
   * 写入语雀的文章缓存 json 文件
   */
  writeYuqueCache() {
    const { yuquePath, _cachedArticles } = this;
    out.info(`writing to local file: ${yuquePath}`);
    fs.writeFileSync(yuquePath, JSON.stringify(_cachedArticles, null, 2), {
      encoding: 'UTF8',
    });
  }

  /**
   * 生成一篇 markdown 文章
   *
   * @param {Object} post 文章详情
   */
  generatePost(post) {
    if (!isPost(post)) {
      out.error(`invalid post: ${post}`);
      return;
    }
    const { postBasicPath } = this;
    const { title, date, body, description, categories, tags, created_at } = post;
    const fileName = post[this.yuqueConfig.mdNameFormat || 'title'];
    const postPath = path.join(postBasicPath, `${fileName}.md`);
    out.info(`generate post file: ${postPath}`);
    const raw = formatRaw(body);
    const text = ejs.render(template, {
      title,
      date: date || formatDate(created_at),
      tags: formatTags(tags),
      categories,
      description,
      raw,
    });
    fs.writeFileSync(postPath, text, {
      encoding: 'UTF8',
    });
  }

  /**
   * 全量生成所有 markdown 文章
   */
  generatePosts() {
    const { _cachedArticles, postBasicPath } = this;
    mkdirp.sync(postBasicPath);
    out.info(`create posts director (if it not exists): ${postBasicPath}`);
    _cachedArticles.forEach(this.generatePost);
  }

  // 文章下载 => 增量更新文章到缓存 json 文件 => 全量生成 markdown 文章
  async autoUpdate() {
    this.readYuqueCache();
    await this.fetchArticles();
    this.writeYuqueCache();
    this.generatePosts();
  }
}

/**
 * 格式化 markdown 内容
 *
 * @param {Array} tags tags
 * @return {String} body
 */
function formatTags(tags) {
  tags = Array.isArray(tags) ? tags : [];
  return `[${tags.join(',')}]`;
}

/**
 * 格式化 markdown 内容
 *
 * @param {String} body md 文档
 * @return {String} body
 */
function formatRaw(body) {
  const multiBr = /(<br>\s){2}/gi;
  const hiddenContent = /<div style="display:none">[\s\S]*?<\/div>/gi;
  return body.replace(hiddenContent, '').replace(multiBr, '<br>');
}

/**
 * front matter 反序列化
 * @description
 * docs: https://www.npmjs.com/package/hexo-front-matter
 *
 * @param {String} body md 文档
 * @return {String} result
 */
function parseMatter(body) {
  body = entities.decode(body);
  try {
    const result = FrontMatter.parse(body);
    result.body = result._content;
    if (result.date) {
      result.date = formatDate(result.date);
    }
    delete result._content;
    return result;
  } catch (error) {
    return {
      body,
    };
  }
}

/**
 * 判断是否为 post
 *
 * @param {*} post 文章
 * @return {Boolean} isPost
 */
function isPost(post) {
  return _.isObject(post) && post.body && post.title;
}

// function doubleDigit(num) {
//   return num < 10 ? '0' + num : num;
// }

function formatDate(date) {
  return moment(date).format('YYYY-MM-DD HH:mm:ss ZZ');
}

/**
 * 自动下载，增量更新
 */
module.exports = async function download() {
  // 检查环境下的 yuque 配置
  const yuquePath = path.join(cwd, 'yuque.json');
  const pkgPath = path.join(cwd, 'package.json');
  let pkg;
  out.info(`loading config: ${pkgPath}`);
  try {
    pkg = require(pkgPath);
  } catch (error) {
    throw new Error('Current directory should have a package.json');
  }
  const { yuqueConfig } = pkg;
  assert(typeof yuqueConfig === 'object', 'package.yueConfig should be an object.');

  // 开始进行文章下载和生成
  out.info(`downloading articles: ${JSON.stringify(yuqueConfig)}`);
  const downloader = new Downloader(yuqueConfig, yuquePath);
  await downloader.autoUpdate();
};
