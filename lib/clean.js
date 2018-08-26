'use strict';

const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const debug = require('debug')('yuque-hexo:cleaner');

module.exports = function clean() {
  const { PWD: pwd } = process.env;
  const yquuePath = path.join(pwd, 'yuque.json');
  const postsPath = path.join(pwd, 'source/_posts/yuque/');
  debug(`remove yuque posts: ${postsPath}`);
  rimraf.sync(postsPath);
  debug(`remove yuque local file: ${yquuePath}`);
  fs.unlinkSync(yquuePath);
}
