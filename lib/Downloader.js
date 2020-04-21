'use strict';

const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const lodash = require('lodash');
const Queue = require('queue');
const filenamify = require('filenamify');
const YuqueClient = require('./yuque');
const { isPost } = require('../util');
const out = require('./out');

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

/**
 * Constructor 下载器
 *
 * @prop {Object} client 语雀 client
 * @prop {Object} config 知识库配置
 * @prop {String} cachePath 下载的文章缓存的 JSON 文件
 * @prop {String} postBasicPath 下载的文章最终生成 markdown 的目录
 * @prop {Array} _cachedArticles 文章列表
 *
 */
class Downloader {
  constructor(config) {
    this.client = new YuqueClient(config);
    this.config = config;
    this.cachePath = path.join(cwd, config.cachePath);
    this.postBasicPath = path.join(cwd, config.postPath);
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
      return client.getArticle(item.slug).then(({ data: article }) => {
        _cachedArticles[index] = article;
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
    const { client, config, _cachedArticles } = this;
    const articles = await client.getArticles();
    if (!Array.isArray(articles.data)) {
      throw new Error(`fail to fetch article list, response: ${JSON.stringify(articles)}`);
    }
    out.info(`article amount: ${articles.data.length}`);
    const realArticles = articles.data
      .filter(article => (config.onlyPublished ? !!article.published_at : true))
      .filter(article => (config.onlyPublic ? !!article.public : true))
      .map(article => lodash.pick(article, PICK_PROPERTY));
    const queue = new Queue({ concurrency: config.concurrency });

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
        out.info('download articles done!');
        resolve();
      });
    });
  }

  /**
   * 读取语雀的文章缓存 json 文件
   */
  readYuqueCache() {
    const { cachePath } = this;
    out.info(`reading from local file: ${cachePath}`);
    try {
      const articles = require(cachePath);
      if (Array.isArray(articles)) {
        this._cachedArticles = articles;
        return;
      }
    } catch (error) {
      out.warn(error.message);
      // Do noting
    }
    this._cachedArticles = [];
  }

  /**
   * 写入语雀的文章缓存 json 文件
   */
  writeYuqueCache() {
    const { cachePath, _cachedArticles } = this;
    out.info(`writing to local file: ${cachePath}`);
    fs.writeFileSync(cachePath, JSON.stringify(_cachedArticles, null, 2), {
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
    const { mdNameFormat, adapter } = this.config;
    const fileName = filenamify(post[mdNameFormat]);
    const postPath = path.join(postBasicPath, `${fileName}.md`);
    let transform;
    try {
      transform = require(path.join(__dirname, '../adapter', adapter));
    } catch (error) {
      out.error(`adpater (${adapter}) is invalid.`);
      process.exit(-1);
    }
    out.info(`generate post file: ${postPath}`);
    const text = transform(post);
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
    out.info(`create posts directory (if it not exists): ${postBasicPath}`);
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

module.exports = Downloader;
