'use strict';

// 七牛云图床
const qiniu = require('qiniu');
const out = require('../../lib/out');
const { transformRes } = require('../index');

const secretId = process.env.SECRET_ID;
const secretKey = process.env.SECRET_KEY;

class QiniuClient {
  constructor(config) {
    this.config = config;
    this.init();
  }

  init() {
    if (!this.config.host) {
      out.error('使用七牛云时，需要在imgCdn中指定域名host');
      process.exit(-1);
    }
    out.info(`图床域名：${this.config.host}`);
    const mac = new qiniu.auth.digest.Mac(secretId, secretKey);
    const putPolicy = new qiniu.rs.PutPolicy({ scope: this.config.bucket }); // 配置
    this.uploadToken = putPolicy.uploadToken(mac); // 获取上传凭证
    const config = new qiniu.conf.Config();
    // 空间对应的机房
    config.zone = qiniu.zone[this.config.region];
    this.formUploader = new qiniu.form_up.FormUploader(config);
    this.bucketManager = new qiniu.rs.BucketManager(mac, config);
    this.putExtra = new qiniu.form_up.PutExtra();
  }

  static getInstance(config) {
    if (!this.instance) {
      this.instance = new QiniuClient(config);
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
    return await new Promise(resolve => {
      this.bucketManager.stat(this.config.bucket, `${this.config.prefixKey}/${fileName}`, (err, respBody, respInfo) => {
        if (err) {
          out.warn(`检查图片信息时出错: ${transformRes(err)}`);
        } else {
          if (respInfo.statusCode === 200) {
            resolve(`${this.config.host}/${this.config.prefixKey}/${fileName}`);
          } else {
            resolve('');
          }
        }
      });
    });
  }

  /**
   * 上传图片到图床
   *
   * @param {Buffer} imgBuffer 文件buffer
   * @param {string} fileName 文件名
   * @return {Promise<string>} 图床的图片url
   */
  async uploadImg(imgBuffer, fileName) {
    return await new Promise(resolve => {
      this.formUploader.put(this.uploadToken, `${this.config.prefixKey}/${fileName}`, imgBuffer, this.putExtra, (respErr,
        respBody, respInfo) => {
        if (respErr) {
          out.warn(`上传图片失败，请检查: ${transformRes(respErr)}`);
          resolve('');
        }
        if (respInfo.statusCode === 200) {
          resolve(`${this.config.host}/${this.config.prefixKey}/${fileName}`);
        } else {
          out.warn(`上传图片失败，请检查: ${transformRes(respInfo)}`);
          resolve('');
        }
      });
    });

  }
}

module.exports = QiniuClient;
