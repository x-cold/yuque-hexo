'use strict';

const CosClient = require('./cos');
const OssClient = require('./oss');
const QiniuClient = require('./qiniu');
const UPClient = require('./upyun');
const GithubClient = require('./github');
const out = require('../../lib/out');

// 目前已适配图床列表
const imageBedList = [ 'qiniu', 'cos', 'oss', 'upyun', 'github' ];

class ImageBeds {
  constructor(config) {
    this.config = config;
    this.imageBedInstance = this.getImageBedInstance(config.imageBed);
  }

  static getInstance(config) {
    if (!this.instance) {
      this.instance = new ImageBeds(config);
    }
    return this.instance;
  }

  /**
   * 获取图床对象的实例
   *
   * @param {string} imageBed 图床类型: cos | oss
   * @return {any} 图床实例
   */
  getImageBedInstance(imageBed) {
    if (!imageBedList.includes(imageBed)) {
      out.error(`imageBed配置错误，目前只支持${imageBedList.toString()}`);
      process.exit(-1);
    }
    switch (imageBed) {
      case 'cos':
        return CosClient.getInstance(this.config);
      case 'oss':
        return OssClient.getInstance(this.config);
      case 'qiniu':
        return QiniuClient.getInstance(this.config);
      case 'upyun':
        return UPClient.getInstance(this.config);
      case 'github':
        return GithubClient.getInstance(this.config);
      default:
        return QiniuClient.getInstance(this.config);
    }
  }

  /**
   * 检查图床是否已经存在图片，存在则返回url
   *
   * @param {string} fileName 文件名
   * @return {Promise<string>} 图片url
   */
  async hasImage(fileName) {
    return await this.imageBedInstance.hasImage(fileName);
  }

  /**
   * 上传图片到图床
   *
   * @param {Buffer} imgBuffer 文件buffer
   * @param {string} fileName 文件名
   * @return {Promise<string>} 图床的图片url
   */
  async uploadImg(imgBuffer, fileName) {
    return await this.imageBedInstance.uploadImg(imgBuffer, fileName);
  }

}

module.exports = ImageBeds;

