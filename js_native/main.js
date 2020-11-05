'use strict';

const { readFileSync } = require('fs');

const cmd_list = ['gen-system', 'test-system'];
const base_options = ['--help', '-h'];
const cmd = process.argv[2];

if (base_options.includes(cmd)) {
  if (cmd === '--help' || cmd === '-h') {
    console.log(readFileSync(__dirname + '/help/main.txt').toString());
  }
  return;
}

if (!cmd_list.includes(cmd)) {
  throw new Error(`cmd ${cmd} is not a valid command`);
}

// Pass along arguments to the appropriate command.
require(`./lib/${cmd}.js`)(process.argv.slice(3));
