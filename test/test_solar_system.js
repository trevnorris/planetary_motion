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

//const solar_system = new SolarSystem([sun, venus, earth, mars, jupiter]);
const solar_system = new SolarSystem([sun, earth]);

//const log_file_fd = fs.openSync(`${__dirname}/logs/${Date.now()}.log`, 'w+');

//console.log(JSON.stringify(solar_system.bodies().map(e => format_planet(e))));
//return;

//console.log(earth);
//return;

// Quarter year in seconds: 31556736

solar_system.bodies().forEach(e => print_planet(e));
//print_planet(sun);
//print_planet(venus);
//print_planet(earth);
//print_planet(mars);
//print_planet(jupiter);
console.log();

const earth_pos = earth.position();

let min_len = Number.MAX_SAFE_INTEGER;
let max_len = 0;

const STEP_SEC = 1;
const YEARS = 10;
const ITER = YEARS * 365 * 24 * 60 * 60 / STEP_SEC;

//for (let i = 0; i < ITER; i += 1) {
let iter = 0;
const d = Date.now();
const t = process.hrtime();
while (Date.now() - d < (1000 * 10)) {
  for (let i = 0; i < 100000; i++) {
    iter++;
    solar_system.step(STEP_SEC);
  }

  //const m = earth_pos.len();
  //if (m > max_len) max_len = m;
  //if (m < min_len) min_len = m;

  // Only save data for every week.
  /*
  if (i % (24 * 60 * 60 / (STEP_SEC >>> 0) * 7) === 0) {
    fs.writeSync(log_file_fd,
                 JSON.stringify(solar_system.bodies().map(format_planet)) + '\n');
  }
  */
}

const u = process.hrtime(t);

solar_system.bodies().forEach(e => print_planet(e));
//print_planet(sun);
//print_planet(venus);
//print_planet(earth);
//print_planet(mars);
//print_planet(jupiter);

//console.log(min_len / AU, max_len / AU);

//console.log(`step_sec: ${STEP_SEC}   ${((u[0] * 1e9 + u[1]) / ITER).toFixed(2)} ns/iter   ${(u[0] + u[1] / 1e9).toFixed(2)} seconds`);
console.log(`step: ${STEP_SEC}   iter: ${iter}   ${((u[0] * 1e9 + u[1]) / iter).toFixed(2)} ns/iter   ${((u[0] + u[1] / 1e9) / 60).toFixed(2)} minutes`);
console.log(`${(iter / 60 / 60 / 24 / 365.256).toFixed(3)} years computed`);


function print_planet(p) {
  const pos = p.position();
  const vel = p.velocity();
  const acc = p.acceleration();
  console.log(p.name);
  console.log(`  [position]     x: ${(pos[0]/AU).toFixed(3)}\ty: ${(pos[1]/AU).toFixed(3)}\tmag: ${(pos.len()/AU).toFixed(3)}`);
  console.log(`  [velocity]     x: ${vel[0].toExponential(3).replace('+','')}\ty: ${vel[1].toExponential(3).replace('+','')}\tsun: ${(pos.mag(sun.position())/AU).toFixed(3)}`);
  console.log(`  [acceleration] x: ${acc[0].toExponential(3).replace('+','')}\ty: ${acc[1].toExponential(3).replace('+','')}`);
}

function format_planet(p) {
  const pos = p.position();
  const vel = p.velocity();
  const acc = p.acceleration();
  return {
    name: p.name,
    //mass: p.mass,
    pos: { x: pos[0], y: pos[1], z: pos[2] },
    vel: { x: vel[0], y: vel[1], z: vel[2] },
    accel: { x: acc[0], y: acc[1], z: acc[2] },
  };
}
