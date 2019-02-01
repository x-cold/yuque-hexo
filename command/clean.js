'use strict';

const Command = require('common-bin');
const initConfig = require('../config'); // 初始化 config
const cleaner = require('../lib/cleaner');
const out = require('../lib/out');

class CleanCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: yuque-hexo clean';
  }

  async run() {
    if (!initConfig) {
      process.exit(0);
    }
    cleaner.cleanPosts();
    cleaner.clearCache();
    out.info('yuque-hexo clean done!');
  }
}

module.exports = CleanCommand;
