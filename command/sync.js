'use strict';

const Command = require('common-bin');

const clean = require('../lib/clean');
const download = require('../lib/download');

class AddCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: yuque-hexo sync';
  }

  async run({ argv }) {
    clean();
    await download();
  }
}

module.exports = AddCommand;