'use strict';

const Command = require('common-bin');

const cleaner = require('../lib/clean');
const out = require('../lib/out');

class CleanCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: yuque-hexo sync';
  }

  async run() {
    out.info('yuque-hexo clean start.');
    cleaner.cleanPosts();
    cleaner.cleanYuqueCache();
    out.info('yuque-hexo clean finished.');
  }
}

module.exports = CleanCommand;
