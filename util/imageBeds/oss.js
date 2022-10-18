'use strict';

// 阿里云图床
const OSS = require('ali-oss');
const out = require('../../lib/out');
const { transformRes } = require('../index');

const secretId = process.env.SECRET_ID;
const secretKey = process.env.SECRET_KEY;


class OssClient {
  constructor(config) {
    this.config = config;
    this.imageBedInstance = new OSS({
      bucket: config.bucket,
      // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
      region: config.region,
      // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
      accessKeyId: secretId,
      accessKeySecret: secretKey,
    });
  }

  static getInstance(config) {
    if (!this.instance) {
      this.instance = new OssClient(config);
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
      await this.imageBedInstance.head(`${this.config.prefixKey}/${fileName}`);
      return `https://${this.config.bucket}.${this.config.region}.aliyuncs.com/${this.config.prefixKey}/${fileName}`;
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
      const res = await this.imageBedInstance.put(`${this.config.prefixKey}/${fileName}`, imgBuffer);
      return res.url;
    } catch (e) {
      out.warn(`上传图片失败，请检查: ${e}`);
      return '';
    }
  }
}

module.exports = OssClient;
