'use strict';

const { formatRaw } = require('../util');

/**
 * markdown 文章生产适配器
 *
 * @param {Object} post 文章
 * @return {String} text
 */
module.exports = function(post) {
  const { body } = post;
  const raw = formatRaw(body);
  return raw;
};
