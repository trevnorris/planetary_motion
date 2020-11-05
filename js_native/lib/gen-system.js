'use strict';

const ini = require('ini');
const { readFileSync } = require('fs');
const { deep_numberify } = require('./utils.js');

function gen_system(pargs) {
  const argv = parse_args(pargs)

  if (argv.help) {
    return console.log(
      readFileSync(__dirname + '/../help/gen-system.txt').toString());
  }

  if (argv.config) {
    return gen_from_config(argv);
  }
}

function parse_args(pargs) {
  return require('minimist')(pargs, {
    alias: {
      h: 'help',
    }
  });
}

function gen_from_config(argv) {
  const file = readFileSync(argv.config).toString();
  const config = deep_numberify(ini.parse(file));
}

module.exports = gen_system;
