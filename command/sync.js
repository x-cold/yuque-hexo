'use strict';

const Command = require('common-bin');

const cleaner = require('../lib/clean');
const download = require('../lib/download');

class SyncCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: yuque-hexo sync';
  }

  async run({ argv }) {
    cleaner.cleanPosts();
    await download();
  }
}

module.exports = SyncCommand;
