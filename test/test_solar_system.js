'use strict';

const Vector = require('../lib/vector');
const SystemBody = require('../lib/system_body');
const SolarSystem = require('../lib/solar_system');
const { AU, SUN_MASS, EARTH_MASS, EARTH_SPEED } = require('../lib/constants');

const sun = new SystemBody('sun', SUN_MASS);
const earth = new SystemBody('earth',
                             EARTH_MASS,
                             new Vector(AU, 0, 0),
                             //new Vector(AU/2, 129555555772.04196, 0),
                             new Vector(0, 0, 0));
                             //new Vector(0, EARTH_SPEED, 0));
const solar_system = new SolarSystem([sun, earth]);

//console.log(earth);
//return;

// Quarter year in seconds: 31556736

const day_sec = 24 * 60 * 60;
const year_sec = 365.24 * day_sec;

const planet = earth;


//const t = process.hrtime();

const ITER = 65;
for (let i = 0; i < ITER; i += 1) {
  solar_system.step(day_sec);

  print_planet(planet);
  console.log();
}

//const u = process.hrtime(t);
//console.log((u[0] * 1e9 + u[1]) / i);

//solar_system.step(31556736);

//console.log(earth);


function print_planet(p) {
  const pos = p.position();
  const vel = p.velocity();
  const acc = p.acceleration();
  console.log(`[position]     x: ${(pos.x/AU).toFixed(4)}\ty: ${(pos.y/AU).toFixed(4)}\tmag: ${(pos.len()/AU).toFixed(4)}`);
  console.log(`[velocity]     x: ${vel.x.toExponential(3)}\ty: ${vel.y.toExponential(3)}`);
  console.log(`[acceleration] x: ${acc.x.toExponential(3)}\ty: ${acc.y.toExponential(3)}`);
}
