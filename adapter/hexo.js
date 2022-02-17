'use strict';

const ejs = require('ejs');
const Entities = require('html-entities').AllHtmlEntities;
const FrontMatter = require('hexo-front-matter');
const { formatDate, formatRaw } = require('../util');
const img2Cdn = require('../util/img2cdn');
const config = require('../config');


const entities = new Entities();
// 背景色区块支持
const colorBlocks = {
  ':::tips\n': '<div style="background: #FFFBE6;padding:10px;border: 1px solid #C3C3C3;border-radius:5px;margin-bottom:5px;">',
  ':::danger\n': '<div style="background: #FFF3F3;padding:10px;border: 1px solid #DEB8BE;border-radius:5px;margin-bottom:5px;">',
  ':::info\n': '<div style="background: #E8F7FF;padding:10px;border: 1px solid #ABD2DA;border-radius:5px;margin-bottom:5px;">',
  '\\s+:::': '</div>',
};

// 文章模板
const template = `---
<%- matter -%>

<%- raw -%>`;

/**
 * front matter 反序列化
 * @description
 * docs: https://www.npmjs.com/package/hexo-front-matter
 *
 * @param {String} body md 文档
 * @return {String} result
 */
function parseMatter(body) {
  body = entities.decode(body);
  try {
    // front matter信息的<br/>换成 \n
    const regex = /(title:|layout:|tags:|date:|categories:){1}(\S|\s)+?---/gi;
    body = body.replace(regex, a =>
      a.replace(/(<br \/>|<br>|<br\/>)/gi, '\n')
    );
    // 支持提示区块语法
    for (const key in colorBlocks) {
      body = body.replace(new RegExp(key, 'igm'), colorBlocks[key]);
    }
    const result = FrontMatter.parse(body);
    result.body = result._content;
    if (result.date) {
      result.date = formatDate(result.date);
    }
    delete result._content;
    return result;
  } catch (error) {
    return {
      body,
    };
  }
}

/**
 * hexo 文章生产适配器
 *
 * @param {Object} post 文章
 * @return {String} text
 */
module.exports = async function(post) {
  // 语雀img转成自己的cdn图片
  if (config.imgCdn.enabled) {
    post = await img2Cdn(post);
  }
  // matter 解析
  const parseRet = parseMatter(post.body);
  const { body, ...data } = parseRet;
  const { title, slug: urlname, created_at } = post;
  const raw = formatRaw(body);
  const date = data.date || formatDate(created_at);
  const tags = data.tags || [];
  const categories = data.categories || [];
  const props = {
    title: title.replace(/"/g, ''), // 临时去掉标题中的引号，至少保证文章页面是正常可访问的
    urlname,
    date,
    ...data,
    tags,
    categories,
  };
  const text = ejs.render(template, {
    raw,
    matter: FrontMatter.stringify(props),
  });
  return text;
};
