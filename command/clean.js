'use strict';

const Command = require('common-bin');

const clean = require('../lib/clean');

class AddCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: yuque-hexo sync';
  }

  async run({ argv }) {
    clean();
  }
}

module.exports = AddCommand;