'use strict';

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
  return body;
}

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
