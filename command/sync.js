'use strict';

const Command = require('common-bin');
const config = require('../config');
const cleaner = require('../lib/cleaner');
const Downloader = require('../lib/Downloader');
const out = require('../lib/out');

class SyncCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: yuque-hexo sync';
  }

  async run() {
    // clear previous directory.
    out.info('clear previous directory.');
    cleaner.cleanPosts();
    // get articles from yuque or cache
    const downloader = new Downloader(config);
    await downloader.autoUpdate();
    out.info('yuque-hexo sync done!');
  }
}

module.exports = SyncCommand;
