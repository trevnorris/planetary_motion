'use strict';

const { readFileSync } = require('fs');

const cmd_list = ['gen-system', 'test-system'];
const base_options = ['--help', '-h'];
const cmd = process.argv[2];

if (!cmd || !cmd_list.includes(cmd) || cmd === '--help' || cmd === '-h') {
  return console.log(readFileSync(__dirname + '/help/main.txt').toString());
}

if (base_options.includes(cmd)) {
  // Process passed commands here.
}

// Pass along arguments to the appropriate command.
require(`./lib/${cmd}.js`)(process.argv.slice(3));
