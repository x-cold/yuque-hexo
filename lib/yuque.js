'use strict';

const SDK = require('@yuque/sdk');

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

class YuqueClient extends SDK {
  constructor(config) {
    const { baseUrl, login, repo, token } = config;
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
