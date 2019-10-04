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

const sun = new SystemBody({
  name: 'sun',
  mass: SUN.MASS,
  radius: SUN.RADIUS,
});

const mercury = new SystemBody({
  name: 'mercury',
  mass: MERCURY.MASS,
  inclination: MERCURY.INCLINATION.INVARIABLE,
  semi_major: MERCURY.SEMI_MAJOR,
  aphelion: MERCURY.APHELION,
  eccentricity: MERCURY.ECCENTRICITY,
  radius: MERCURY.RADIUS,
});

const venus = new SystemBody({
  name: 'venus',
  mass: VENUS.MASS,
  inclination: VENUS.INCLINATION.INVARIABLE,
  semi_major: VENUS.SEMI_MAJOR,
  aphelion: VENUS.APHELION,
  eccentricity: VENUS.ECCENTRICITY,
  radius: VENUS.RADIUS,
});

const earth = new SystemBody({
  name: 'earth',
  mass: EARTH.MASS,
  inclination: EARTH.INCLINATION.INVARIABLE,
  semi_major: EARTH.SEMI_MAJOR,
  aphelion: EARTH.APHELION,
  eccentricity: EARTH.ECCENTRICITY,
  radius: EARTH.RADIUS,
});

const mars = new SystemBody({
  name: 'mars',
  mass: MARS.MASS,
  inclination: MARS.INCLINATION.INVARIABLE,
  semi_major: MARS.SEMI_MAJOR,
  aphelion: MARS.APHELION,
  eccentricity: MARS.ECCENTRICITY,
  radius: MARS.RADIUS,
});

const jupiter = new SystemBody({
  name: 'jupiter',
  mass: JUPITER.MASS,
  inclination: JUPITER.INCLINATION.INVARIABLE,
  semi_major: JUPITER.SEMI_MAJOR,
  aphelion: JUPITER.APHELION,
  eccentricity: JUPITER.ECCENTRICITY,
  radius: JUPITER.RADIUS,
});

const saturn = new SystemBody({
  name: 'saturn',
  mass: SATURN.MASS,
  inclination: SATURN.INCLINATION.INVARIABLE,
  semi_major: SATURN.SEMI_MAJOR,
  aphelion: SATURN.APHELION,
  eccentricity: SATURN.ECCENTRICITY,
  radius: SATURN.RADIUS,
});

const uranus = new SystemBody({
  name: 'uranus',
  mass: URANUS.MASS,
  inclination: URANUS.INCLINATION.INVARIABLE,
  semi_major: URANUS.SEMI_MAJOR,
  aphelion: URANUS.APHELION,
  eccentricity: URANUS.ECCENTRICITY,
  radius: URANUS.RADIUS,
});

const neptune = new SystemBody({
  name: 'neptune',
  mass: NEPTUNE.MASS,
  inclination: NEPTUNE.INCLINATION.INVARIABLE,
  semi_major: NEPTUNE.SEMI_MAJOR,
  aphelion: NEPTUNE.APHELION,
  eccentricity: NEPTUNE.ECCENTRICITY,
  radius: NEPTUNE.RADIUS,
});

const ssm = new SolarSystem();

ssm.set_sun(sun)
   .add_body(mercury)
   .add_body(venus)
   .add_body(earth)
   .add_body(mars)
   .add_body(jupiter)
   .add_body(saturn)
   .add_body(uranus)
   .add_body(neptune);


ssm.init();

ssm.bodies().forEach(e => print_planet_init(e));
console.log();

function hrtime() {
  const t = process.hrtime();
  return t[0] * 1e9 + t[1];
}

const YEARS = 10;
const STEP = 1;
const TOTAL_TIME = YEAR_SEC * YEARS;
const SEG_PER = (STEP * 3155693) / TOTAL_TIME;
let iter = 0;
let t = hrtime();
let last = t;

for (let i = 0; i < TOTAL_TIME; i += STEP) {
  if ((i / STEP) % 3155693 < 1) {
    const u = hrtime();
    const s = (u - last) / 1e9;
    last = u;
    const est = (s / SEG_PER) * (1 - (i * STEP) / TOTAL_TIME);
    process.stdout.cursorTo(0);
    process.stdout.clearLine();
    process.stdout.write(`${(i * STEP / YEAR_SEC).toFixed(1)} year(s) calculated`);
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
ssm.bodies().forEach(e => print_planet(e));


console.log(`step: ${STEP}   iter: ${iter}   ${(t / iter).toFixed(2)} ns/iter   ${(t / 1e9 / 60).toFixed(2)} minutes`);
console.log(`${(iter * STEP / YEAR_SEC).toFixed(3)} years computed`);

/* debug:start */
function fxd(n, m) {
  return n.toFixed(m || 7)
}
/* debug:stop */

function orbital_period(p) {
  return 2 * Math.PI * Math.sqrt(p.inicon.semi_major**3 / (sun.mass * G));
}

function print_planet_init(p) {
  const vel = p.velocity();
  console.log(p.name);
  console.log(`  velocity: ${fxd(vel.len(), 2)} m/s  \tperiod: ${fxd(orbital_period(p) / YEAR_SEC, 4)} years`);
}

function print_planet(p) {
  const pos = p.position();
  const vel = p.velocity();
  const acc = p.acceleration();
  console.log(p.name);
  console.log(`  [position]     x: ${fxd(pos.x / AU)}\ty: ${fxd(pos.y / AU)}\tz: ${fxd(pos.z / AU)}\tmag: ${fxd(pos.mag(sun.velocity()) / AU)}`);
  console.log(`  [velocity]     x: ${fxd(vel.x, 2)}\ty: ${fxd(vel.y, 2)}\tz: ${fxd(vel.z, 2)}\tvel: ${fxd(vel.len(), 1)} m/s`);
/* debug:start */
  //console.log(`  [incline]      min: ${fxd((Math.asin(p.min_z / pos.len()) * 180 / Math.PI) || 0)}°\tmax: ${fxd((Math.asin(p.max_z / pos.len()) * 180 / Math.PI) || 0)}°`);
  //console.log(`  [apsis]        min: ${fxd(p.min_a / AU)}\tmax: ${fxd(p.max_a / AU)}\te: ${fxd(1-2/(p.max_a/p.min_a+1), 4)}`);
/* debug:stop */
}
