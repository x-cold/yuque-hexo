'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');
const ejs = require('ejs');
const mkdirp = require('mkdirp');
const _ = require('lodash');
const Queue = require('queue');
const Entities = require('html-entities').AllHtmlEntities;
// const debug = require('debug')('yuque-hexo:downloader');
const out = require('./out');
const YuqueClient = require('./yuque');

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

class Downloader {
  constructor(yuqueConfig, yquuePath, postBasicPath) {
    this.client = new YuqueClient(yuqueConfig);
    this.yuqueConfig = yuqueConfig;
    this.yquuePath = yquuePath;
    this.postBasicPath = postBasicPath;
    this._cachedArticles = [];

    this.fetchArtiicle = this.fetchArtiicle.bind(this);
    this.generatePost = this.generatePost.bind(this);
  }

  fetchArtiicle(item, index) {
    const { client, _cachedArticles } = this;
    return function() {
      out.info(`download article body: ${item.title}`);
      return client.getArticle(item.slug)
        .then(({ data: article }) => {
          const newArticle = _cachedArticles[index];
          newArticle.body = article.body;
          newArticle.body_asl = article.body_asl;
          newArticle.body_html = article.body_html;
          _cachedArticles[index] = newArticle;
        });
    };
  }

  async fetchArtiicles() {
    const { client, _cachedArticles } = this;
    const articles = await client.getArticles();
    const realArticles = articles.data.map(article => _.pick(article, PICK_PROPERTY));
    const queue = new Queue({ concurrency: 10 });

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
        queue.push(this.fetchArtiicle(article, cacheIndex));
      } else {
        cacheArticle = _cachedArticles[cacheIndex];
        cacheAvaliable = +new Date(article.updated_at) === +new Date(cacheArticle.updated_at);
        // 文章有变更，更新缓存
        if (!cacheAvaliable) {
          _cachedArticles[cacheIndex] = cacheAvaliable;
          queue.push(this.fetchArtiicle(article, cacheIndex));
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

  readYuqueCache() {
    const { yquuePath } = this;
    out.info(`reading from local file: ${yquuePath}`);
    try {
      const articles = require(yquuePath);
      if (Array.isArray(articles)) {
        this._cachedArticles = articles;
        return;
      }
    } catch (error) {
      // Do noting
    }
    this._cachedArticles = [];
  }

  writeYuqueCache() {
    const { yquuePath, _cachedArticles } = this;
    out.info(`writing to local file: ${yquuePath}`);
    fs.writeFileSync(yquuePath, JSON.stringify(_cachedArticles, null, 2), {
      encoding: 'UTF8',
    });
  }

  generatePost(post) {
    const { postBasicPath } = this;
    const { title, updated_at, body, description } = post;
    const postPath = path.join(postBasicPath, `${title}.md`);
    out.info(`generate post file: ${postPath}`);
    const raw = formatRaw(entities.decode(body));
    const text = ejs.render(template, {
      title,
      date: updated_at,
      tags: '[]',
      categories: '',
      description,
      raw,
    });
    fs.writeFileSync(postPath, text, {
      encoding: 'UTF8',
    });
  }

  generatePosts() {
    const { _cachedArticles, postBasicPath } = this;
    out.info(`create posts director (if it not exists): ${postBasicPath}`);
    mkdirp.sync(postBasicPath);
    _cachedArticles.map(this.generatePost);
  }

  // 文章下载 => 增量更新文章到缓存文件 => 全量生成 markdown 文章
  async autoUpdate() {
    this.readYuqueCache();
    await this.fetchArtiicles();
    this.writeYuqueCache();
    this.generatePosts();
  }
}

function formatRaw(str) {
  const multiBr = /(<br>\s){2}/gi;
  return str.replace(multiBr, '<br>');
}

/**
 * 自动下载，增量更新
 */
module.exports = async function download() {
  // 检查环境下的 yuque 配置
  const yquuePath = path.join(cwd, 'yuque.json');
  const pkgPath = path.join(cwd, 'package.json');
  const postBasicPath = path.join(cwd, 'source/_posts/yuque');
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
  const downloader = new Downloader(yuqueConfig, yquuePath, postBasicPath);
  await downloader.autoUpdate();
};
