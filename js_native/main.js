'use strict';

const build_type = process.features.debug ? 'Debug' : 'Release';
const motion = require(`./build/${build_type}/addon`);


