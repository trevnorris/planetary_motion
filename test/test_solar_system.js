'use strict';

const fs = require('fs');
const Vector = require('../lib/vector');
const SystemBody = require('../lib/system_body');
const SolarSystem = require('../lib/solar_system');
const { CONSTS, SUN, EARTH, MARS, VENUS, JUPITER, SATURN, URANUS } =
  require('../lib/constants');
const { AU } = CONSTS;

// TODO(trevnorris): Calculate the barycenter of the sun vs all the other
// planets, and use that offset for the position vector of the sun.
const sun = new SystemBody('sun', SUN.MASS);

const venus = new SystemBody('venus',
                             VENUS.MASS,
                             new Vector(VENUS.AVG_APSIS, 0, 0),
                             new Vector(0, VENUS.AVG_SPEED, 0));

const earth = new SystemBody('earth',
                             EARTH.MASS,
                             new Vector(EARTH.AVG_APSIS, 0, 0),
                             new Vector(0, EARTH.AVG_SPEED, 0));

const mars = new SystemBody('mars',
                            MARS.MASS,
                            new Vector(MARS.AVG_APSIS, 0, 0),
                            new Vector(0, MARS.AVG_SPEED, 0));

const jupiter = new SystemBody('jupiter',
                               JUPITER.MASS,
                               new Vector(JUPITER.AVG_APSIS, 0, 0),
                               new Vector(0, JUPITER.AVG_SPEED, 0));

const saturn = new SystemBody('saturn',
                              SATURN.MASS,
                              new Vector(SATURN.AVG_APSIS, 0, 0),
                              new Vector(0, SATURN.AVG_SPEED, 0));

const uranus = new SystemBody('uranus',
                              URANUS.MASS,
                              new Vector(URANUS.AVG_APSIS, 0, 0),
                              new Vector(0, URANUS.AVG_SPEED, 0));

const ssm = new SolarSystem([sun, venus, earth, mars, jupiter, saturn, uranus]);


function hrtime() {
  const t = process.hrtime();
  return t[0] * 1e9 + t[1];
}

ssm.bodies().forEach(e => print_planet(e));
console.log();

const STEP = 1;
const YEARS = 1;

let iter = 0;
let t = hrtime();

for (let i = 0; i < 365.256 * 86400 * YEARS; i += STEP) {
  if (i % 3155673 === 0) {
    process.stdout.cursorTo(0);
    process.stdout.write(`${(i / (365.256 * 86400)).toFixed(1)} year(s)`);
  }
  iter++;
  ssm.step(STEP);
}

t = hrtime() - t;

ssm.bodies().forEach(e => print_planet(e));


console.log(`step: ${STEP}   iter: ${iter}   ${(t / iter).toFixed(2)} ns/iter   ${(t / 1e9 / 60).toFixed(2)} minutes`);
console.log(`${(iter * STEP / 60 / 60 / 24 / 365.256).toFixed(3)} years computed`);


function print_planet(p) {
  const pos = p.position();
  const vel = p.velocity();
  const acc = p.acceleration();
  console.log(p.name);
  console.log(`  [position]     x: ${(pos.x/AU).toFixed(3)}\ty: ${(pos.y/AU).toFixed(3)}\tmag: ${(pos.len()/AU).toFixed(3)}`);
  console.log(`  [velocity]     x: ${vel.x.toFixed(3)}\ty: ${vel.y.toFixed(3)}\tsun: ${(pos.mag(sun.position())/AU).toFixed(3)}`);
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
