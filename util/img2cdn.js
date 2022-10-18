'use strict';

const superagent = require('superagent');
const getEtag = require('../lib/qetag');
const config = require('../config');
const out = require('../lib/out');
const ImageBed = require('./imageBeds');
const Queue = require('queue');
const lodash = require('lodash');

const imageBed = config.imgCdn.enabled ? ImageBed.getInstance(config.imgCdn) : null;

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
        .set('User-Agent', 'Mozilla/5.0')
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
 * 将article中body中的语雀url进行替换
 * @param {*} article 文章
 * @return {*} 文章
 */
async function img2Cdn(article) {
  // 1。从文章中获取语雀的图片URL列表
  const matchYuqueImgUrlList = article.body.match(imageUrlRegExp);
  if (!matchYuqueImgUrlList) return article;
  const promiseList = matchYuqueImgUrlList.map(matchYuqueImgUrl => {
    return async () => {
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
        // 4。检查图床是否存在该文件
        let url = await imageBed.hasImage(fileName);
        let exists = true;
        // 5。如果图床已经存在，直接替换；如果图床不存在，则先上传到图床，再将原本的语雀url进行替换
        if (!url) {
          url = await imageBed.uploadImg(imgBuffer, fileName);
          exists = false;
        }
        return {
          originalUrl: matchYuqueImgUrl,
          yuqueRealImgUrl: yuqueImgUrl,
          url,
          exists,
        };
      } catch (e) {
        out.error(`访问图床出错，请检查配置: ${e}`);
        return {
          yuqueRealImgUrl: yuqueImgUrl,
          url: '',
        };
      }
    };
  });
  // 并发数
  const concurrency = config.imgCdn.concurrency || promiseList.length;
  const queue = new Queue({ concurrency, results: [] });
  queue.push(...promiseList);
  await new Promise(resolve => {
    queue.start(() => {
      resolve();
    });
  });
  const _urlList = queue.results;
  const urlList = lodash.flatten(_urlList);

  urlList.forEach(function(url) {
    if (url.url) {
      article.body = article.body.replace(url.originalUrl, `![](${url.url})`);
      if (url.exists) {
        out.info(`图片已存在 skip: ${url.url}`);
      } else {
        out.info(`replace ${url.yuqueRealImgUrl} to ${url.url}`);
      }
    } else {
      out.warn(`图片替换失败，将使用原url： ${url.yuqueRealImgUrl}`);
    }
  });
  return article;
}

module.exports = img2Cdn;

