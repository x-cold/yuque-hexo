'use strict';

const moment = require('moment');
const lodash = require('lodash');
const prettier = require('prettier');

/**
 * 格式化 markdown 中的 tags
 *
 * @param {Array} tags tags
 * @return {String} body
 */
function formatTags(tags) {
  tags = Array.isArray(tags) ? tags : [];
  return `[${tags.join(',')}]`;
}

exports.formatTags = formatTags;

/**
 * 格式化 front matter 中的可嵌套数组
 *
 * @param {Array} list list
 * @return {String} body
 */
function formatList(list = []) {
  const result = [];
  for (const item of list) {
    if (Array.isArray(item)) {
      result.push(formatList(item));
    } else {
      result.push(item);
    }
  }
  return `[${result.join(',')}]`;
}

exports.formatList = formatList;

/**
 * 格式化 markdown 内容
 *
 * @param {String} body md 文档
 * @return {String} body
 */
function formatRaw(body) {
  const multiBr = /(<br>[\s\n]){2}/gi;
  const multiBrEnd = /(<br \/>[\n]?){2}/gi;
  const brBug = /<br \/>/g;
  const hiddenContent = /<div style="display:none">[\s\S]*?<\/div>/gi;
  // 删除语雀特有的锚点
  const emptyAnchor = /<a name=\".*?\"><\/a>/g;
  body = body
    .replace(hiddenContent, '')
    .replace(multiBr, '<br>')
    .replace(multiBrEnd, '<br />\n')
    .replace(brBug, '\n')
    .replace(emptyAnchor, '');
  return prettier.format(body, { parser: 'markdown' });
}

exports.formatRaw = formatRaw;

/**
 * 判断是否为 post
 *
 * @param {*} post 文章
 * @return {Boolean} isPost
 */
function isPost(post) {
  return lodash.isObject(post) && post.body && post.title;
}

exports.isPost = isPost;

function doubleDigit(num) {
  return num < 10 ? '0' + num : num;
}

exports.doubleDigit = doubleDigit;

function formatDate(date) {
  return moment(new Date(date).toISOString()).format('YYYY-MM-DD HH:mm:ss ZZ');
}

exports.formatDate = formatDate;
