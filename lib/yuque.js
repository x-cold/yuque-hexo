'use strict';

const SDK = require('@yuque/sdk');
const urllib = require('urllib');
const debug = require('debug')('yuque-hexo:client');
const deprecate = require('depd')('yuque-hexo');

function handler(res) {
  // should handler error yourself
  if (res.status !== 200) {
    const err = new Error(res.data.message);
    /* istanbul ignore next */
    err.status = res.data.status || res.status;
    err.code = res.data.code;
    err.data = res;
    throw err;
  }
  // return whatever you want
  return res.data;
}

/**
 * doesn't support token
 */
class AnonymousYuqueClient {
  constructor(config) {
    const { baseUrl, login, repo } = config;
    this.config = Object.assign({}, config);
    this.config.namespace = `${login}/${repo}`;
    debug(`create client: baseUrl: ${baseUrl}, login: ${login}, repo: ${repo}`);
  }

  async _fetch(method, api, data) {
    const { baseUrl, namespace, timeout = 30000 } = this.config;
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

class YuqueClient extends SDK {
  constructor(config) {
    const { baseUrl, login, repo, token } = config;
    if (!token) {
      deprecate('TOKEN of yuque will be required while verion >v1.6.0.');
      return new AnonymousYuqueClient(config);
    }
    const endpoint = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const superConfig = {
      endpoint,
      token,
      handler,
    };
    super(superConfig);
    this.namespace = `${login}/${repo}`;
  }

  async getArticles() {
    const { namespace } = this;
    const result = await this.docs.list({ namespace });
    return result;
  }

  async getArticle(slug) {
    const { namespace } = this;
    const result = await this.docs.get({ namespace, slug, data: { raw: 1 } });
    return result;
  }
}

module.exports = YuqueClient;
