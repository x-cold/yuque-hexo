'use strict';

const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const out = require('./out');

const cwd = process.cwd();

module.exports = {
  cleanPosts() {
    const postsPath = path.join(cwd, 'source/_posts/yuque/');
    out.info(`remove yuque posts: ${postsPath}`);
    rimraf.sync(postsPath);
  },

  cleanYuqueCache() {
    const yquuePath = path.join(cwd, 'yuque.json');
    try {
      out.info(`remove yuque local file: ${yquuePath}`);
      fs.unlinkSync(yquuePath);
    } catch (error) {
      out.warn(error.message);
    }
  },
};
