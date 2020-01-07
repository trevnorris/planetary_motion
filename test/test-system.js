'use strict';

const { System, SystemBody } = require('../lib/system');
const { sec_to_string } = require('../lib/misc_fns');
const constants = require('../lib/constants');
const { AU, YEAR_SEC } = constants.CONSTS;
const { black_body_temp, temp2distance } = require('../lib/effective_temp');
const { SUN } = constants;

var argv = require('minimist')(process.argv.slice(2));

const sun = new SystemBody("sun", SUN.MASS, SUN.RADIUS);
const mercury = create_planet("mercury", sun, constants.MERCURY);
const venus = create_planet("venus", sun, constants.VENUS);
const earth = create_planet("earth", sun, constants.EARTH);
const mars = create_planet("mars", sun, constants.MARS);
const jupiter = create_planet("jupiter", sun, constants.JUPITER);
const saturn = create_planet("saturn", sun, constants.SATURN);
const uranus = create_planet("uranus", sun, constants.URANUS);
const neptune = create_planet("neptune", sun, constants.NEPTUNE);

// [ min, max, avg ]
earth.bbt = [Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER, 0];

const system = new System();
system.add_body(sun)
      //.add_body(mercury)
      //.add_body(venus)
      .add_body(earth)
      //.add_body(mars)
      .add_body(jupiter)
      .add_body(saturn)
      //.add_body(uranus)
      //.add_body(neptune);


const years = argv.years || 1;
const step = argv.step || 1;
const total_time = years * YEAR_SEC;
const len = Math.floor(total_time / step);
let iter = 0;
let t = hrtime();

for (let i = 0; i < total_time; i += step) {
  print_time(i);
  iter++;
  system.step(step);
  const bbt = black_body_temp(SUN.SURFACE_TEMP,
                              SUN.RADIUS,
                              earth.pos().mag(sun.pos()),
                              0.367);
  earth.bbt[2] += bbt / len;
  if (bbt < earth.bbt[0]) earth.bbt[0] = bbt;
  if (bbt > earth.bbt[1]) earth.bbt[1] = bbt;
}
t = hrtime() - t;

process.stdout.cursorTo(0);
process.stdout.clearLine();

system.bodies().forEach(b => print_body(b));
console.log(`step: ${step}   iter: ${iter}   ${(t / iter).toFixed(2)} ns/iter   ${(t / 1e9 / 60).toFixed(2)} minutes`);
console.log(`${(iter * step / 60 / 60 / 24 / 365.256).toFixed(3)} years computed`);
console.log(earth.bbt);


function create_planet(name, orbiting, k) {
  const body = new SystemBody(name, k.MASS, k.RADIUS);
  body.set_orbit(orbiting, {
    M: orbiting.mass(),
    a: k.SEMI_MAJOR,
    e: k.ECCENTRICITY,
    i: k.INCLINATION,
    w: k.PERIAPSIS_ARG,
    Om: k.ASCENDING_NODE,
    E: 0,
  });
  return body;
}


function print_time(i) {
  if (!(i % (YEAR_SEC / 10 * step) < 1)) return;
  const u = (hrtime() - t) / 1e9;
  const est = u / (i / total_time) - u * (i / total_time);
  process.stdout.cursorTo(0);
  process.stdout.clearLine();
  process.stdout.write(`${(i / YEAR_SEC).toFixed(1)} year(s) calculated`);
  if (Number.isFinite(est)) {
    process.stdout.write(`   ${sec_to_string(est)} remaining`);
  }
}


function print_body(b) {
  const pos = b.pos();
  const vel = b.vel();
  const acc = b.acc();
  const o = b.orbiting();
  if (!o) return;
  console.log(b.name());
  console.log(`  [position]     x: ${(pos.x/AU).toFixed(3)}\ty: ${(pos.y/AU).toFixed(3)}\torbiting: ${(pos.mag(o.pos())/AU).toFixed(3)} AU`);
  console.log(`  [velocity]     x: ${vel.x.toFixed(3)}\ty: ${vel.y.toFixed(3)}\tspeed: ${vel.len().toFixed(3)} m/s`);
}


function hrtime() {
  const t = process.hrtime();
  return t[0] * 1e9 + t[1];
}
