#!/usr/bin/env node

var pkg = require('./package.json')

process.title = 'jmht-cli'

/* eslint-disable no-unused-expressions */
// this actually makes the whole parsing magic of yargs run
require('yargs')
  .usage('$0 <command> [options]')
  .help()
  .version(pkg.version)
  .option('verbose', {
    alias: 'v',
    global: true,
    default: false
  })
  .options('mysql')
  .commandDir('cmds')
  .demandCommand()
  .epilogue('for more information, check the readme at https://github.com/groupsky/jacksmhtools-client')
  .argv
/* eslint-enable no-unused-expressions */
