'use strict';

// Github图床
const urllib = require('urllib');
const out = require('../../lib/out');
const { transformRes } = require('../index');

const secretId = process.env.SECRET_ID;
const secretKey = process.env.SECRET_KEY;


class GithubClient {
  constructor(config) {
    this.config = config;
    this.init();
  }

  init() {
    if (!this.config.host) {
      out.warn('未指定加速域名，将使用默认域名：https://raw.githubusercontent.com');
    }
    // 如果指定了加速域名
    if (this.config.host && this.config.host.includes('cdn.jsdelivr.net')) {
      this.config.host = 'https://cdn.jsdelivr.net';
      out.info(`图床域名：${this.config.host}`);
    }
  }

  static getInstance(config) {
    if (!this.instance) {
      this.instance = new GithubClient(config);
    }
    return this.instance;
  }

  async _fetch(method, fileName, base64File) {
    const path = `https://api.github.com/repos/${secretId}/${this.config.bucket}/contents/${this.config.prefixKey}/${fileName}`;
    const data = method === 'PUT' ? {
      message: 'yuque-hexo upload images',
      content: base64File,
    } : null;
    try {
      const result = await urllib.request(path, {
        dataType: 'json',
        method,
        data,
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'yuque-hexo',
          Authorization: `token ${secretKey}`,
        },
      });
      if (result.status === 409) {
        out.warn('由于github并发问题，图片上传失败');
        return '';
      }
      if (result.status === 200 || result.status === 201) {
        if (this.config.host) {
          return `${this.config.host}/gh/${secretId}/${this.config.bucket}/${this.config.prefixKey}/${fileName}`;
        }
        if (method === 'GET') {
          return result.data.download_url;
        }
        return result.data.content.download_url;
      }
      method === 'PUT' && out.warn(`请求图片失败，请检查: ${transformRes(result)}`);
      return '';
    } catch (error) {
      out.warn(`请求图片失败，请检查: ${transformRes(error)}`);
      return '';
    }
  }


  /**
   * 检查图床是否已经存在图片，存在则返回url,不存在返回空
   *
   * @param {string} fileName 文件名
   * @return {Promise<string>} 图片url
   */
  async hasImage(fileName) {
    try {
      return await this._fetch('GET', fileName);
    } catch (e) {
      out.warn(`检查图片信息时出错: ${transformRes(e)}`);
      return '';
    }
  }

  /**
   * 上传图片到图床
   *
   * @param {Buffer} imgBuffer 文件buffer
   * @param {string} fileName 文件名
   * @return {Promise<string>} 图床的图片url
   */
  async uploadImg(imgBuffer, fileName) {
    try {
      const base64File = imgBuffer.toString('base64');
      const imgUrl = await this._fetch('PUT', fileName, base64File);
      if (imgUrl) return imgUrl;
    } catch (e) {
      out.warn(`上传图片失败，请检查: ${e}`);
    }
  }
}

module.exports = GithubClient;
