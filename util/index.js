'use strict';

const moment = require('moment');
const lodash = require('lodash');

/**
 * 格式化 markdown 内容
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
 * 格式化 markdown 内容
 *
 * @param {String} body md 文档
 * @return {String} body
 */
function formatRaw(body) {
  const multiBr = /(<br>\s){2}/gi;
  const hiddenContent = /<div style="display:none">[\s\S]*?<\/div>/gi;
  return body.replace(hiddenContent, '').replace(multiBr, '<br>');
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
  return moment(date).format('YYYY-MM-DD HH:mm:ss ZZ');
}

exports.formatDate = formatDate;
