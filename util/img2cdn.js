'use strict';

const COS = require('cos-nodejs-sdk-v5');
const superagent = require('superagent');
const getEtag = require('../lib/qetag');
const config = require('../config');
const out = require('../lib/out');

const bucket = config.imgCdn.bucket;
const region = config.imgCdn.region;
const prefixKey = config.imgCdn.prefixKey;

const secretId = process.env.SECRET_ID;
const secretKey = process.env.SECRET_KEY;

const cos = new COS({
  SecretId: secretId, // 身份识别ID
  SecretKey: secretKey, // 身份秘钥
});

// 获取语雀的图片链接的正则表达式
const imageUrlRegExp = /!\[(.*?)]\((.*?)\)/mg;

/**
 * 将图片转成buffer
 *
 * @param {string} yuqueImgUrl 语雀图片url
 * @return {Promise<Buffer>} 文件buffer
 */
async function img2Buffer(yuqueImgUrl) {
  return await new Promise(async function(resolve) {
    try {
      await superagent
        .get(yuqueImgUrl)
        .buffer(true)
        .parse(res => {
          const buffer = [];
          res.on('data', chunk => {
            buffer.push(chunk);
          });
          res.on('end', () => {
            const data = Buffer.concat(buffer);
            resolve(data);
          });
        });
    } catch (e) {
      out.warn(`invalid img: ${yuqueImgUrl}`);
      resolve(null);
    }
  });
}

/**
 * 从markdown格式的url中获取url
 *
 * @param {string} markdownImgUrl markdown语法图片
 * @return {string} 图片url
 */
function getImgUrl(markdownImgUrl) {
  const _temp = markdownImgUrl.replace(/\!\[(.*?)]\(/, '');
  const _temp_index = _temp.indexOf(')');
  // 得到真正的语雀的url
  return _temp.substring(0, _temp_index)
    .split('#')[0];
}

/**
 * 根据文件内容获取唯一文件名
 *
 * @param {Buffer} imgBuffer 文件buffer
 * @param {string} yuqueImgUrl 语雀图片url
 * @return {Promise<string>} 图片文件名称
 */
async function getFileName(imgBuffer, yuqueImgUrl) {
  return new Promise(resolve => {
    getEtag(imgBuffer, hash => {
      const imgName = hash;
      const imgSuffix = yuqueImgUrl.substring(yuqueImgUrl.lastIndexOf('.'));
      const fileName = `${imgName}${imgSuffix}`;
      resolve(fileName);
    });
  });
}

/**
 * 检查COS是否已经存在图片，存在则返回url
 *
 * @param {string} fileName 文件名
 * @return {Promise<string>} 图片url
 */
async function hasObject(fileName) {
  if (!bucket.length || !region.length) {
    out.error('请检查COS配置');
    process.exit(-1);
  }
  return new Promise(resolve => {
    cos.headObject({
      Bucket: bucket, // 存储桶名字（必须）
      Region: region, // 存储桶所在地域，必须字段
      Key: `${prefixKey}/${fileName}`, //  文件名  必须
    }, function(err, data) {
      if (data) {
        const url = `https://${bucket}.cos.${region}.myqcloud.com/${prefixKey}/${fileName}`;
        resolve(url);
      } else {
        resolve('');
      }
    });
  });

}

/**
 * 上传图片到COS
 *
 * @param {Buffer} imgBuffer 文件buffer
 * @param {string} fileName 文件名
 * @return {Promise<string>} 图床的图片url
 */
async function uploadImg(imgBuffer, fileName) {
  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket: bucket, // 存储桶名字（必须）
      Region: region, // 存储桶所在地域，必须字段
      Key: `${prefixKey}/${fileName}`, //  文件名  必须
      StorageClass: 'STANDARD', // 上传模式（标准模式）
      Body: imgBuffer, // 上传文件对象
    }, function(err, data) {
      if (data) {
        resolve(`https://${data.Location}`);
      }
      if (err) {
        reject(err);
      }
    });
  });
}

/**
 * 将article中body中的语雀url进行替换
 *
 * @param {*} article 文章
 * @return {*} 文章
 */
async function img2Cos(article) {
  // 1。从文章中获取语雀的图片URL列表
  const matchYuqueImgUrlList = article.body.match(imageUrlRegExp);
  if (!matchYuqueImgUrlList) return article;
  const promiseList = matchYuqueImgUrlList.map(async matchYuqueImgUrl => {
    // 获取真正的图片url
    const yuqueImgUrl = getImgUrl(matchYuqueImgUrl);
    // 2。将图片转成buffer
    const imgBuffer = await img2Buffer(yuqueImgUrl);
    if (!imgBuffer) {
      return {
        originalUrl: matchYuqueImgUrl,
        yuqueRealImgUrl: yuqueImgUrl,
        url: yuqueImgUrl,
      };
    }
    // 3。根据buffer文件生成唯一的hash文件名
    const fileName = await getFileName(imgBuffer, yuqueImgUrl);
    try {
      // 4。检查COS是否存在该文件
      let url = await hasObject(fileName);
      // 5。如果COS已经存在，直接替换；如果COS不存在，则先上传到COS，再将原本的语雀url进行替换
      if (!url) {
        url = await uploadImg(imgBuffer, fileName);
      }
      return {
        originalUrl: matchYuqueImgUrl,
        yuqueRealImgUrl: yuqueImgUrl,
        url,
      };
    } catch (e) {
      out.error('访问COS出错，请检查配置');
      process.exit(-1);
    }
  });
  const urlList = await Promise.all(promiseList);
  urlList.forEach(function(url) {
    if (url) {
      article.body = article.body.replace(url.originalUrl, `![](${url.url})`);
      out.info(`replace ${url.yuqueRealImgUrl} to ${url.url}`);
    }
  });
  return article;
}

module.exports = img2Cos;

