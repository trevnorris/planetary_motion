'use strict';

const ini = require('ini');
const { readFileSync } = require('fs');
const { deep_numberify, rand_range } = require('./utils.js');
const {
  calc_orbit_period,
  kep_to_cart,
  temp_to_semimajor,
} = require('./equations.js');

const star_fields = ['mass', 'radius', 'temp', 'type'];
const planet_fields1 = ['mass', 'albedo', 'bb_temp'];
const planet_fields2 = ['a', 'e', 'i', 'w', 'Om', 'm'];
const planet_fields3 = ['x', 'y', 'z', 'v_x', 'v_y', 'v_z'];

module.exports = gen_system;


function gen_system(pargs) {
  const argv = parse_args(pargs)

  if (argv.help || pargs.length === 0) {
    return console.log(
      readFileSync(__dirname + '/../help/gen-system.txt').toString());
  }

  if (argv.config) {
    return gen_from_config(argv);
  }
}


function gen_from_config(argv) {
  const file = readFileSync(argv.config).toString();
  const config = deep_numberify(ini.parse(file));
  const system = { planet: {} };

  const er = validate_config(config);
  if (er) {
    console.error(er);
    process.exit(1);
  }

  // First generate the star
  const star = config.star;
  if (star.classification) {
    system.star = generate_star(star.classification);
  } else {
    system.star = { mass: star.mass, radius: star.radius, temp: star.temp };
  }

  // Then generate each planet
  for (const n in config.planet) {
    const p = config.planet[n];

    // First generate if given pos and vel directly.
    if (check_if_vals_exist(p, planet_fields3)) {
      system.planet[n] = {
        x: p.x, y: p.y, z: p.z, v_x: p.v_x, v_y: p.v_y, v_z: p.v_z,
      };

    // Then generate if kep coord are given.
    } else if (check_if_vals_exist(p, planet_fields2)) {
      const [c, v] = kep_to_cart(star.mass, p.a, p.e, p.i, p.w, p.Om, p.m);
      system.planet[n] =
        { ...p, x: c.x, y: c.y, z: c.z, v_x: v.x, v_y: v.y, v_z: v.z,
          period: calc_orbit_period(p.a, star.mass) };

    // Finally generate from basic data.
    } else if (check_if_vals_exist(p, planet_fields1)) {
      system.planet[n] = generate_planet(p, system.star);

    } else {
      throw new Error('UNREACHABLE');
    }
  }

  console.log(system);
}


function validate_config(obj) {
  if (!obj.star)
    return 'missing star in config';
  if (!obj.planet)
    return 'no planets listed';
  if (!obj.star.classification && !check_if_vals_exist(obj.star, star_fields))
    return 'invalid star fields';
  for (let p in obj.planet) {
    const er = validate_planet(obj.planet[p]);
    if (er) return `${er}\n${p}:${JSON.stringify(obj.planet[p])}`;
  }
  return null;
}


function validate_planet(planet) {
  if (!check_if_vals_exist(planet, planet_fields1) &&
      !check_if_vals_exist(planet, planet_fields2) &&
      !check_if_vals_exist(planet, planet_fields3)) {
    return `planet has invalid or missing fields`;
  }
  return null;
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
  // TODO
}


// mass, radius, albedo, bb_temp
function generate_planet(p, star) {
  // TODO
  const M = star.mass;
  const a = temp_to_semimajor(p.bb_temp, star.temp, star.radius, p.albedo);
  const e = p.e || rand_range(0.005, 0.02);
  const i = p.i || rand_range(0.005, 2);
  const w = p.w || rand_range(-179.9, 179.9);
  const Om = p.Om || rand_range(-179.9, 179.9);
  const m = p.m || rand_range(0, 359.9);
  //const [c, v] = kep_to_cart(M, a, e, i, w, Om, m);
  const [c, v] = kep_to_cart(M, a, e, i, w, Om, m);
  return {
    ...p,
    M, a, e, i, w, Om, m,
    x: c.x, y: c.y, z: c.z,
    v_x: v.x, v_y: v.y, v_z: v.z,
    period: calc_orbit_period(a, star.mass),
  };
}


function parse_args(pargs) {
  return require('minimist')(pargs, {
    alias: {
      c: 'config',
      h: 'help',
    }
  });
}
