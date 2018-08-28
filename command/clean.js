'use strict';

const Command = require('common-bin');

const cleaner = require('../lib/clean');

class CleanCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: yuque-hexo sync';
  }

  async run({ argv }) {
    cleaner.cleanPosts();
    cleaner.cleanYuqueCache();
  }
}

module.exports = CleanCommand;
