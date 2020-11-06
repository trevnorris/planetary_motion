'use strict';

const ini = require('ini');
const { readFileSync } = require('fs');
const { deep_numberify } = require('./utils.js');

const star_fields = ['color', 'mass', 'radius', 'temp'];
const planet_fields1 = ['mass', 'radius', 'albedo', 'bb_temp'];
const planet_fields2 = ['a', 'e', 'i', 'w', 'Om', 'E', 'v', 'r', 'h'];

module.exports = gen_system;

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
  const system = {};

  validate_config(config);

  // First generate the star
  const star = config.star;
  if (star.classification) {
    system.star = generate_star(star.classification);
  } else {
    system.star = { mass: star.mass, radius: star.radius, temp: star.temp };
  }

  // Then generate each planet
}

function validate_config(obj) {
  if (!obj.star)
    throw new Error('missing star in config');
  const star = obj.star;
  if (!star.classification && !check_if_vals_exist(star, star_fields))
    throw new Error('invalid star fields');

  if (!obj.planet)
    throw new Error('no planets listed');
  for (let p in obj.planet)
    validate_planet(obj.planet[p]);
}

function validate_planet(planet) {
  if (!check_if_vals_exist(planet, planet_fields1) &&
      !check_if_vals_exist(planet, planet_fields2)) {
    throw new Error(`planet ${p} has invalid or missing fields`);
  }
}

function check_if_vals_exist(obj, arr) {
  for (const v of arr) {
    if (obj[v] === undefined)
      return false;
  }
  return true;
}

function generate_star(classification) {
  classification = classification.toLowerCase();
}
