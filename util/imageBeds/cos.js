'use strict';

// 腾讯云图床
const COS = require('cos-nodejs-sdk-v5');
const out = require('../../lib/out');

const secretId = process.env.SECRET_ID;
const secretKey = process.env.SECRET_KEY;


class CosClient {
  constructor(config) {
    this.config = config;
    this.imageBedInstance = new COS({
      SecretId: secretId, // 身份识别ID
      SecretKey: secretKey, // 身份秘钥
    });
  }

  static getInstance(config) {
    if (!this.instance) {
      this.instance = new CosClient(config);
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
      await this.imageBedInstance.headObject({
        Bucket: this.config.bucket, // 存储桶名字（必须）
        Region: this.config.region, // 存储桶所在地域，必须字段
        Key: `${this.config.prefixKey}/${fileName}`, //  文件名  必须
      });
      return `https://${this.config.bucket}.cos.${this.config.region}.myqcloud.com/${this.config.prefixKey}/${fileName}`;
    } catch (e) {
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
      const res = await this.imageBedInstance.putObject({
        Bucket: this.config.bucket, // 存储桶名字（必须）
        Region: this.config.region, // 存储桶所在地域，必须字段
        Key: `${this.config.prefixKey}/${fileName}`, //  文件名  必须
        StorageClass: 'STANDARD', // 上传模式（标准模式）
        Body: imgBuffer, // 上传文件对象
      });
      return `https://${res.Location}`;
    } catch (e) {
      out.warn(`上传图片失败，请检查: ${e}`);
      return '';
    }
  }
}

module.exports = CosClient;
