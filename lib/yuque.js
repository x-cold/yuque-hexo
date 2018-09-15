'use strict';

const urllib = require('urllib');
const debug = require('debug')('yuque-hexo:client');

class YuqueClient {
  constructor(config) {
    const { baseUrl, login, repo } = config;
    this.config = Object.assign({}, config);
    this.config.namespace = `${login}/${repo}`;
    debug(`create client: baseUrl: ${baseUrl}, login: ${login}, repo: ${repo}`);
  }

  async _fetch(method, api, data) {
    const { baseUrl, namespace, timeout = 10000 } = this.config;
    const path = `${baseUrl}/repos/${namespace}${api}`;
    debug(`request data: api: ${path}, data: ${data}`);
    try {
      const result = await urllib.request(path, {
        dataType: 'json',
        method,
        data,
        timeout,
      });
      return result.data;
    } catch (error) {
      throw new Error(`请求数据失败: ${error.message}`);
    }
  }

  async getArticles() {
    const api = '/docs';
    const result = await this._fetch('GET', api);
    return result;
  }

  async getArticle(slug) {
    const api = `/docs/${slug}?raw=true`;
    const result = await this._fetch('GET', api);
    return result;
  }

  // async getToc() {
  //   const api = '/toc';
  //   const result = await this._fetch('GET', api);
  //   return result;
  // }
}

module.exports = YuqueClient;
