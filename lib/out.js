'use strict';

const chalk = require('chalk');

module.exports = {
  // log(...args) {
  //   const prefix = chalk.green('[LOG]');
  //   args.unshift(prefix);
  //   console.log.apply(console, args);
  // },
  info(...args) {
    const prefix = chalk.green('[INFO]');
    args.unshift(prefix);
    console.log.apply(console, args);
  },
  warn(...args) {
    const prefix = chalk.yellow('[WARNING]');
    args.unshift(prefix);
    console.log.apply(console, args);
  },
  error(...args) {
    const prefix = chalk.red('[ERROR]');
    args.unshift(prefix);
    console.log.apply(console, args);
  },
};
