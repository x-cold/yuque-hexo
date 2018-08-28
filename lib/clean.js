'use strict';

const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const debug = require('debug')('yuque-hexo:cleaner');

const { PWD: pwd } = process.env;

module.exports = {
  cleanPosts() {
    const postsPath = path.join(pwd, 'source/_posts/yuque/');
    try {
      debug(`remove yuque posts: ${postsPath}`);
      rimraf.sync(postsPath);
    } catch(error) {
      console.error(error.message);
    }
  },

  cleanYuqueCache() {
    const yquuePath = path.join(pwd, 'yuque.json');
    try {
      debug(`remove yuque local file: ${yquuePath}`);
      fs.unlinkSync(yquuePath);
    } catch(error) {
      console.error(error.message);
    }
  }
};
