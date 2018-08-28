'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');
const ejs = require('ejs');
const mkdirp = require('mkdirp');
const _ = require('lodash');
const Entities = require('html-entities').AllHtmlEntities;
const debug = require('debug')('yuque-hexo:downloader');
const YuqueClient = require('./yuque');

const entities = new Entities();
const { PWD: pwd } = process.env;

// 需要提取的文章属性字段
const PICK_PROPERTY = [
  'title',
  'description',
  'created_at',
  'updated_at',
  'published_at',
  'format',
  'slug',
  'last_editor'
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

    this.generatePost = this.generatePost.bind(this);
  }

  async fetchAllArtiicles() {
    const { client } = this;
    const articles = await client.getArticles();
    const realArticles = articles.data.map(article => _.pick(article, PICK_PROPERTY));
    const promises = realArticles.map((item) => {
      return client.getArticle(item.slug);
    });
    const result = await Promise.all(promises)
      .then((vals) => {
        const arr = vals.map(({ data: article }, index) => {
          const newArticle = realArticles[index];
          newArticle.body = article.body;
          newArticle.body_asl = article.body_asl;
          newArticle.body_html = article.body_html;
          return newArticle;
        });
        return arr;
      });
    return result;
  }

  read() {
    const { yquuePath } = this;
    debug(`reading from local file: ${yquuePath}`);
    try {
      const articles = require(yquuePath);
      if (Array.isArray(articles)) {
        this._cachedArticles = articles;
        return;
      }
    } catch(error) {
      // Do noting
    }
    this._cachedArticles = [];
  }

  write() {
    const { yquuePath, _cachedArticles } = this;
    debug(`writing to local file: ${yquuePath}`);
    fs.writeFileSync(yquuePath, JSON.stringify(_cachedArticles, null , 2), {
      encoding: 'UTF8',
    });
  }

  generatePost(post) {
    const { postBasicPath } = this;
    const { title, updated_at, body, description } = post;
    const postPath = path.join(postBasicPath, `${title}.md`);
    debug(`generate post file: ${postPath}`);
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
    debug(`create posts director (if it not exists): ${postBasicPath}`);
    mkdirp.sync(postBasicPath);
    _cachedArticles.map(this.generatePost);
  }

  async autoUpdate() {
    // this.read();
    this._cachedArticles = await this.fetchAllArtiicles();
    this.write();
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
  const yquuePath = path.join(pwd, 'yuque.json');
  const pkgPath = path.join(pwd, 'package.json');
  const postBasicPath = path.join(pwd, 'source/_posts/yuque');
  let pkg;
  debug(`loading config: ${pkgPath}`);
  try {
    pkg = require(pkgPath);
  } catch(error) {
    throw new Error('Current directory should have a package.json');
  }
  const { yuqueConfig } = pkg;
  assert(typeof yuqueConfig === 'object', 'package.yueConfig should be an object.');

  debug(`downloading articles: ${JSON.stringify(yuqueConfig)}`);
  const downloader = new Downloader(yuqueConfig, yquuePath, postBasicPath);
  await downloader.autoUpdate();
}
