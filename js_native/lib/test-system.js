'use strict';

let motion = null;

try {
  const build_type = process.features.debug ? 'Debug' : 'Release';
  motion = require(`./build/${build_type}/addon`);
} catch {
  // TODO(trevnorris): Setup to use JS impl instead of native in case loading
  // native failed.
}

function test_system(pargs) {
  const argv = require('minimist')(pargs);
}

module.exports = test_system;
