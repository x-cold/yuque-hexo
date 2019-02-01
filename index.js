'use strict';

const path = require('path');
const Command = require('common-bin');
const initConfig = require('./config'); // 初始化 config

class MainCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: yuque-hexo <command>';

    if (!initConfig) {
      process.exit(0);
    }

    // load sub command
    this.load(path.join(__dirname, 'command'));
  }
}

module.exports = MainCommand;
