'use strict';

// 又拍云图床
const upyun = require('upyun');
const out = require('../../lib/out');

const secretId = process.env.SECRET_ID;
const secretKey = process.env.SECRET_KEY;

class UPClient {
  constructor(config) {
    this.config = config;
    this.init();
  }
  init() {
    if (!this.config.host) {
      out.warn(`未指定域名host，将使用测试域名：http://${this.config.bucket}.test.upcdn.net`);
      this.config.host = `http://${this.config.bucket}.test.upcdn.net`;
    }
    // 如果不指定协议，默认使用http
    if (!this.config.host.startsWith('http')) {
      this.config.host = `http://${this.config.bucket}`;
      out.info(`图床域名：${this.config.host}`);
    }
    this.imageBedInstance = new upyun.Client(new upyun.Service(this.config.bucket, secretId, secretKey));
  }

  static getInstance(config) {
    if (!this.instance) {
      this.instance = new UPClient(config);
    }
    return this.instance;
  }

  /**
   * 检查图床是否已经存在图片，存在则返回url,不存在返回空
   *
   * @param {string} fileName 文件名
   * @return {Promise<string>} 图片url
   */
  async hasImage(fileName) {
    try {
      const res = await this.imageBedInstance.headFile(`${this.config.prefixKey}/${fileName}`);
      if (res) {
        return `${this.config.host}/${this.config.prefixKey}/${fileName}`;
      }
      return '';
    } catch (e) {
      out.warn(`上传图片失败，请检查: ${e}`);
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
      const res = await this.imageBedInstance.putFile(`${this.config.prefixKey}/${fileName}`, imgBuffer);
      if (res) {
        return `${this.config.host}/${this.config.prefixKey}/${fileName}`;
      }
      out.warn('上传图片失败，请检查又拍云配置');
      return '';
    } catch (e) {
      out.warn(`上传图片失败，请检查: ${e}`);
      return '';
    }
  }
}

module.exports = UPClient;

