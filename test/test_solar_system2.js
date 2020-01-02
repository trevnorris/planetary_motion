'use strict';

const fs = require('fs');
const Vector = require('../lib/vector');
const SystemBody = require('../lib/system_body2');
const SolarSystem = require('../lib/solar_system2');
const { sec_to_string } = require('../lib/misc_fns');
const {
  CONSTS, SUN, EARTH, MARS, VENUS, MERCURY, JUPITER, SATURN, URANUS, NEPTUNE
} = require('../lib/constants');
const { AU, G, YEAR_SEC } = CONSTS;

var argv = require('minimist')(process.argv.slice(2));

const sun = new SystemBody({
  name: 'sun',
  mass: SUN.MASS,
  radius: SUN.RADIUS,
});

// NOTE: Mercury should shift 0.0001193898674128766° per revolution.
const mercury = new SystemBody({
  name: 'mercury',
  mass: MERCURY.MASS,
  inclination: MERCURY.INCLINATION,
  semi_major: MERCURY.SEMI_MAJOR,
  eccentricity: MERCURY.ECCENTRICITY,
  radius: MERCURY.RADIUS,
  periapsis_arg: MERCURY.PERIAPSIS_ARG,
  ascending_node: MERCURY.ASCENDING_NODE,
  sun,
});

const venus = new SystemBody({
  name: 'venus',
  mass: VENUS.MASS,
  inclination: VENUS.INCLINATION,
  semi_major: VENUS.SEMI_MAJOR,
  eccentricity: VENUS.ECCENTRICITY,
  radius: VENUS.RADIUS,
  periapsis_arg: VENUS.PERIAPSIS_ARG,
  ascending_node: VENUS.ASCENDING_NODE,
  sun,
});

const earth = new SystemBody({
  name: 'earth',
  mass: EARTH.MASS,
  inclination: EARTH.INCLINATION,
  semi_major: EARTH.SEMI_MAJOR,
  eccentricity: EARTH.ECCENTRICITY,
  radius: EARTH.RADIUS,
  periapsis_arg: EARTH.PERIAPSIS_ARG,
  ascending_node: EARTH.ASCENDING_NODE,
  sun,
});

const mars = new SystemBody({
  name: 'mars',
  mass: MARS.MASS,
  inclination: MARS.INCLINATION,
  semi_major: MARS.SEMI_MAJOR,
  eccentricity: MARS.ECCENTRICITY,
  radius: MARS.RADIUS,
  periapsis_arg: MARS.PERIAPSIS_ARG,
  ascending_node: MARS.ASCENDING_NODE,
  sun,
});

const jupiter = new SystemBody({
  name: 'jupiter',
  mass: JUPITER.MASS,
  inclination: JUPITER.INCLINATION,
  semi_major: JUPITER.SEMI_MAJOR,
  eccentricity: JUPITER.ECCENTRICITY,
  radius: JUPITER.RADIUS,
  periapsis_arg: JUPITER.PERIAPSIS_ARG,
  ascending_node: JUPITER.ASCENDING_NODE,
  sun,
});

const saturn = new SystemBody({
  name: 'saturn',
  mass: SATURN.MASS,
  inclination: SATURN.INCLINATION,
  semi_major: SATURN.SEMI_MAJOR,
  eccentricity: SATURN.ECCENTRICITY,
  radius: SATURN.RADIUS,
  periapsis_arg: SATURN.PERIAPSIS_ARG,
  ascending_node: SATURN.ASCENDING_NODE,
  sun,
});

const uranus = new SystemBody({
  name: 'uranus',
  mass: URANUS.MASS,
  inclination: URANUS.INCLINATION,
  semi_major: URANUS.SEMI_MAJOR,
  eccentricity: URANUS.ECCENTRICITY,
  radius: URANUS.RADIUS,
  periapsis_arg: URANUS.PERIAPSIS_ARG,
  ascending_node: URANUS.ASCENDING_NODE,
  sun,
});

const neptune = new SystemBody({
  name: 'neptune',
  mass: NEPTUNE.MASS,
  inclination: NEPTUNE.INCLINATION,
  semi_major: NEPTUNE.SEMI_MAJOR,
  eccentricity: NEPTUNE.ECCENTRICITY,
  radius: NEPTUNE.RADIUS,
  periapsis_arg: NEPTUNE.PERIAPSIS_ARG,
  ascending_node: NEPTUNE.ASCENDING_NODE,
  sun,
});

const ssm = new SolarSystem();

ssm.set_sun(sun)
   .add_body(mercury)
   .add_body(venus)
   .add_body(earth)
   //.add_body(mars)
   //.add_body(jupiter)
   //.add_body(saturn)
   //.add_body(uranus)
   //.add_body(neptune);


//ssm.init();

//ssm.bodies().forEach(e => print_planet_init(e));
ssm.bodies().forEach(e => print_planet(e));
console.log();

function hrtime() {
  const t = process.hrtime();
  return t[0] * 1e9 + t[1];
}

const YEARS = argv.years || 1;
const STEP = argv.step || 1;
const TOTAL_TIME = YEAR_SEC * YEARS;
const SEG_PER = (STEP * 3155693) / TOTAL_TIME;
let iter = 0;
let t = hrtime();

for (let i = 0; i < TOTAL_TIME; i += STEP) {
  if (i % (YEAR_SEC / 10 * STEP) < 1) {
    const u = (hrtime() - t) / 1e9;
    const est = u / (i / TOTAL_TIME) - u * (i / TOTAL_TIME);
    process.stdout.cursorTo(0);
    process.stdout.clearLine();
    process.stdout.write(`${(i / YEAR_SEC).toFixed(1)} year(s) calculated`);
    if (Number.isFinite(est)) {
      process.stdout.write(`   ${sec_to_string(est)} remaining`);
    }
  }
  iter++;
  ssm.step(STEP);
}

t = hrtime() - t;

process.stdout.cursorTo(0);
process.stdout.clearLine();
print_sun(sun);
ssm.bodies().forEach(e => print_planet(e));


console.log(`step: ${STEP}   iter: ${iter}   ${(t / iter).toFixed(2)} ns/iter   ${(t / 1e9 / 60).toFixed(2)} minutes`);
console.log(`${(iter * STEP / YEAR_SEC).toFixed(3)} years computed`);

/* debug:start */
function fxd(n, m) {
  return n.toFixed(m || 12)
}
/* debug:stop */

function orbital_period(p) {
  return 2 * Math.PI * Math.sqrt(p.inicon.semi_major**3 / (sun.mass * G));
}

function print_planet_init(p) {
  const vel = p.velocity();
  const f = 1 + p.inicon.eccentricity;
  console.log(f, p.position().x);
  const peri = p.position().clone().mul_s(f);
  console.log(p.name);
  console.log(`  velocity: ${fxd(vel.len(), 2)} m/s  \tperiod: ${fxd(orbital_period(p) / YEAR_SEC, 6)} years  \tmag: ${fxd(sun.position().mag(p.position()) / AU)}`);
  console.log(`  aphelion: x: ${fxd(peri.x / AU)}  y: ${fxd(peri.y / AU)}  z: ${fxd(peri.z / AU)}`);
}

function print_planet(p) {
  const pos = p.position();
  const vel = p.velocity();
  const acc = p.acceleration();
  const lac = p._last_alphelion_coord;
  const lpc = p._last_perihelion_coord;
  console.log(p.name);
  console.log(`  [position]     x: ${fxd(pos.x / AU)}   y: ${fxd(pos.y / AU)}   z: ${fxd(pos.z / AU)}   mag: ${fxd(pos.mag(sun.position()) / AU)}`);
  console.log(`  [velocity]     x: ${fxd(vel.x, 2)}\ty: ${fxd(vel.y, 2)}\tz: ${fxd(vel.z, 2)}\tvel: ${fxd(vel.len(), 1)} m/s`);
  //console.log(`  [alphelion]   ${fxd(p._last_alphelion / AU)}\tx: ${fxd(lac.x / AU)}\ty: ${fxd(lac.y / AU)}\tz: ${fxd(lac.z / AU)}`);
  //console.log(`  [perihelion]  ${fxd(p._last_perihelion / AU)}\tx: ${fxd(lpc.x / AU)}\ty: ${fxd(lpc.y / AU)}\tz: ${fxd(lpc.z / AU)}`);
  //console.log(`  [distance]    ${fxd(p._total_distance / AU)}`);
  //console.log(`  [angle]    ${180 - fxd((new Vector(p.inicon.perihelion,0,0)).angle(p._last_perihelion_coord) * 180 / Math.PI)}`);
  //console.log(p._cum_acc);
/* debug:start */
  //console.log(fxd(p.mag() / AU));
  //console.log(`  [incline]      min: ${fxd((Math.asin(p.min_z / pos.len()) * 180 / Math.PI) || 0)}°\tmax: ${fxd((Math.asin(p.max_z / pos.len()) * 180 / Math.PI) || 0)}°`);
  //console.log(`  [apsis]        min: ${fxd(p.min_a / AU)}\tmax: ${fxd(p.max_a / AU)}\te: ${fxd(1-2/(p.max_a/p.min_a+1), 4)}`);

  require('fs').writeFileSync(`/tmp/${p.name}-positions.bin`, p._positions.slice(0, p._pos_idx));
/* debug:stop */
}

function print_sun(p) {
  const pos = p.position();
  const vel = p.velocity();
  console.log(p.name);
  console.log(`  [position]     x: ${fxd(pos.x / AU)}   y: ${fxd(pos.y / AU)}   z: ${fxd(pos.z / AU)}   mag: ${fxd(pos.mag(sun.velocity()) / AU)}`);
  console.log(`  [velocity]     x: ${fxd(vel.x, 2)}\ty: ${fxd(vel.y, 2)}\tz: ${fxd(vel.z, 2)}\tvel: ${fxd(vel.len(), 1)} m/s`);
}
