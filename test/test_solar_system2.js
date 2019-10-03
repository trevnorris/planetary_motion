'use strict';

const fs = require('fs');
const Vector = require('../lib/vector');
const SystemBody = require('../lib/system_body2');
const SolarSystem = require('../lib/solar_system2');
const { CONSTS, SUN, EARTH, MARS, VENUS, JUPITER, SATURN, URANUS } =
  require('../lib/constants');
const { AU } = CONSTS;

const sun = new SystemBody({ name: 'sun', mass: SUN.MASS });

const venus = new SystemBody({
  name: 'venus',
  mass: VENUS.MASS,
  inclination: VENUS.INCLINATION.INVARIABLE,
  distance: VENUS.AVG_APSIS,
  velocity: VENUS.AVG_SPEED,
  radius: -1,
});

const earth = new SystemBody({
  name: 'earth',
  mass: EARTH.MASS,
  inclination: EARTH.INCLINATION.INVARIABLE,
  distance: EARTH.AVG_APSIS,
  velocity: EARTH.AVG_SPEED,
  radius: -1,
});

const mars = new SystemBody({
  name: 'mars',
  mass: MARS.MASS,
  inclination: MARS.INCLINATION.INVARIABLE,
  distance: MARS.AVG_APSIS,
  velocity: MARS.AVG_SPEED,
  radius: -1,
});

const jupiter = new SystemBody({
  name: 'jupiter',
  mass: JUPITER.MASS,
  inclination: JUPITER.INCLINATION.INVARIABLE,
  distance: JUPITER.AVG_APSIS,
  velocity: JUPITER.AVG_SPEED,
  radius: -1,
});

const saturn = new SystemBody({
  name: 'saturn',
  mass: SATURN.MASS,
  inclination: SATURN.INCLINATION.INVARIABLE,
  distance: SATURN.AVG_APSIS,
  velocity: SATURN.AVG_SPEED,
  radius: -1,
});

const uranus = new SystemBody({
  name: 'uranus',
  mass: URANUS.MASS,
  inclination: URANUS.INCLINATION.INVARIABLE,
  distance: URANUS.AVG_APSIS,
  velocity: URANUS.AVG_SPEED,
  radius: -1,
});

const ssm = new SolarSystem();

ssm.set_sun(sun)
   .add_body(venus)
   .add_body(earth)
   .add_body(mars)
   .add_body(jupiter)
   .add_body(saturn)
   .add_body(uranus);


ssm.init();

ssm.bodies().forEach(e => print_planet(e));
console.log();

function hrtime() {
  const t = process.hrtime();
  return t[0] * 1e9 + t[1];
}

const YEARS = 1;
const STEP = 1;
let iter = 0;
let t = hrtime();

for (let i = 0; i < 365.256 * 86400 * YEARS; i++) {
  if (i % 3155673 === 0) {
    process.stdout.cursorTo(0);
    process.stdout.write(`${(i / (365.256 * 86400)).toFixed(1)} year(s)`);
  }
  iter++;
  ssm.step(STEP);
}

t = hrtime() - t;

console.log();
ssm.bodies().forEach(e => print_planet(e));


console.log(`step: ${STEP}   iter: ${iter}   ${(t / iter).toFixed(2)} ns/iter   ${(t / 1e9 / 60).toFixed(2)} minutes`);
console.log(`${(iter * STEP / 60 / 60 / 24 / 365.256).toFixed(3)} years computed`);


/* debug:start */
function fxd(n) {
  return n.toFixed(5)
}
/* debug:stop */

function print_planet(p) {
  const pos = p.position();
  const vel = p.velocity();
  const acc = p.acceleration();
  console.log(p.name);
  console.log(`  [position]     x: ${(pos.x / AU).toFixed(3)}\ty: ${(pos.y / AU).toFixed(3)}\tz: ${(pos.z / AU).toFixed(3)}\tmag: ${(pos.len() / AU).toFixed(3)}`);
  console.log(`  [velocity]     x: ${vel.x.toFixed(3)}\ty: ${vel.y.toFixed(3)}\tz: ${(pos.z / AU).toFixed(3)}\tsun: ${(pos.mag(sun.position()) / AU).toFixed(3)}`);
/* debug:start */
  console.log(`  [incline]      min: ${fxd((Math.asin(p.min_z / pos.len()) * 180 / Math.PI) || 0)}°\tmax: ${fxd((Math.asin(p.max_z / pos.len()) * 180 / Math.PI) || 0)}°`);
/* debug:stop */
}

function format_planet(p) {
  const pos = p.position();
  const vel = p.velocity();
  const acc = p.acceleration();
  return {
    name: p.name,
    pos: { x: pos.x, y: pos.y, z: pos.z },
    vel: { x: vel.x, y: vel.y, z: vel.z },
    accel: { x: acc.x, y: acc.y, z: acc.z },
  };
}
