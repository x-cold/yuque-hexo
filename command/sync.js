'use strict';

const Command = require('common-bin');

const cleaner = require('../lib/clean');
const download = require('../lib/download');
const out = require('../lib/out');

class SyncCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: yuque-hexo sync';
  }

  async run() {
    out.info('yuque-hexo sync start.');
    cleaner.cleanPosts();
    await download();
    out.info('yuque-hexo sync finished.');
  }
}

module.exports = SyncCommand;
