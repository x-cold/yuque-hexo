'use strict';

const Command = require('common-bin');
const cleaner = require('../lib/cleaner');
const out = require('../lib/out');

class CleanCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: yuque-hexo clean';
  }

  async run() {
    cleaner.cleanPosts();
    cleaner.clearCache();
    out.info('yuque-hexo clean done!');
  }
}

module.exports = CleanCommand;
