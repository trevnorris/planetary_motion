'use strict';

const Vector = require('./vector');
const { G, C, AU } = require('./constants').CONSTS;
const { gtdilation, rotate_main, rotate_second } = require('./misc_fns');

const bodies_s = Symbol('bodies_list');
const sun_s = Symbol('sun');

class SolarSystem {
  constructor() {
    this[sun_s] = null;
    this[bodies_s] = [];
  }

  // Adjust positions of sun and bodies after calculating the barycenter and
  // setting that coordinate to [0,0,0].
  init() {
    const sun = this[sun_s];
    const sun_pos = sun.position();
    const M = sun.mass;

    // Calculate barycenter, assuming position of the sun is [0,0,0].
    let bc_m = sun.mass;
    let bc_p = new Vector();
    // Calculate all m1 * x1 + ...
    for (let b of this[bodies_s]) {
      const pos = b.position().clone();
      bc_m += b.mass;
      bc_p.add(pos.mul_s(b.mass));
    }
    bc_p.div_s(bc_m);

    // Adjust positions of planets and sun to place barycenter at [0,0,0].
    sun_pos.sub(bc_p);
    for (let b of this[bodies_s]) {
      b.position().sub(bc_p);
    }

    return this;
  }

  set_sun(s) {
    this[sun_s] = s;
    return this;
  }

  add_body(b) {
    this[bodies_s].push(b);
    return this;
  }

  sun() {
    return this[sun_s];
  }

  bodies() {
    return this[bodies_s].slice();
  }

  step(t) {
    const sun = this[sun_s];
    const len = this[bodies_s].length;

    for (let i = 0; i < len; i++) {
      this[bodies_s][i].acceleration().reset();
    }
    sun.acceleration().reset();

    for (let i = 0; i < len; i++) {
      const b1 = this[bodies_s][i];
      for (let j = i + 1; j < len; j++) {
        add_acceleration(b1, this[bodies_s][j]);
      }
      const lm = b1._last_mag;
      const m = b1._last_mag = add_acceleration(sun, b1);
      /*
      if (b1._to_alphelion && m < lm) {
        b1._last_alphelion = lm;
        b1._last_alphelion_coord.set(b1.position());
        b1._to_alphelion = false;
      } else if (!b1._to_alphelion && lm < m) {
        b1._last_perihelion = lm;
        b1._last_perihelion_coord.set(b1.position());
        b1._to_alphelion = true;
      }
      */
      add_position_velocity(b1, t, sun);
    }
    add_position_velocity(sun, t);

    return this;
  }
}

module.exports = SolarSystem;


function had_collision(b1, b2) {
  console.error(b1);
  console.error(b2);
  throw new Error('planets collided');
}


function add_acceleration(b1, b2) {
  const b1_pos = b1.position();
  const b1_acc = b1.acceleration();
  const b2_pos = b2.position();
  const b2_acc = b2.acceleration();
  const rsq = b1_pos.mag_sq(b2_pos);
  const mag = Math.sqrt(rsq);
  const r = 1 / mag;
  let Fg;

  Fg = -G * b2.mass / rsq;
  b1_acc.x += Fg * (b1_pos.x - b2_pos.x) * r;
  b1_acc.y += Fg * (b1_pos.y - b2_pos.y) * r;
  b1_acc.z += Fg * (b1_pos.z - b2_pos.z) * r;

  Fg = -G * b1.mass / rsq;
  b2_acc.x += Fg * (b2_pos.x - b1_pos.x) * r;
  b2_acc.y += Fg * (b2_pos.y - b1_pos.y) * r;
  b2_acc.z += Fg * (b2_pos.z - b1_pos.z) * r;
/* debug:start */
// Sun is b1 when orbiting bodies == 1
/*
// This one actually works
const p = (-((G * b1.mass)**2) / (mag**3 * C**2)) * (6 / mag - 9 / b2.inicon.semi_major);
const _r = b1_pos.clone().sub(b2_pos).mul_s(p);
b2._cum_acc += _r.len();
b2_acc.add(_r);
/* */
/* debug:stop */

  return mag;
}


// TODO: Make planet collision detection better.
//function add_acceleration(b1_pos, b1_acc, b1_mass, b2) {
/*
function add_acceleration(b1, b2) {
  const b1_pos = b1.position();
  const b1_acc = b1.acceleration();
  const b2_pos = b2.position();
  const b2_acc = b2.acceleration();
  const rsq = b1_pos.mag_sq(b2_pos);
  const mag = Math.sqrt(rsq);
  const r = 1 / mag;
  let Fg;

  Fg = -G * b2.mass / rsq;
  b1_acc.x += Fg * (b1_pos.x - b2_pos.x) * r;
  b1_acc.y += Fg * (b1_pos.y - b2_pos.y) * r;
  b1_acc.z += Fg * (b1_pos.z - b2_pos.z) * r;

  Fg = -G * b1.mass / rsq;
  b2_acc.x += Fg * (b2_pos.x - b1_pos.x) * r;
  b2_acc.y += Fg * (b2_pos.y - b1_pos.y) * r;
  b2_acc.z += Fg * (b2_pos.z - b1_pos.z) * r;

  return mag;
}
*/

  //if (b1.radius + b2.radius < 0) {
  //}

// Could store rsq from above onto the planet. Would need to confirm that the
// planet is not the sun.
function add_position_velocity(b1, t, sun) {
  const b1_pos = b1.position();
  const b1_vel = b1.velocity();
  const b1_acc = b1.acceleration();
  const t_sq = t**2;
/* debug:start */
  const x0 = b1_pos.x;
  const y0 = b1_pos.y;
  const z0 = b1_pos.z;
/* debug:stop */
  b1_pos.x += b1_vel.x * t + b1_acc.x * t_sq / 2;
  b1_pos.y += b1_vel.y * t + b1_acc.y * t_sq / 2;
  b1_pos.z += b1_vel.z * t + b1_acc.z * t_sq / 2;
  b1_vel.x += b1_acc.x * t;
  b1_vel.y += b1_acc.y * t;
  b1_vel.z += b1_acc.z * t;
/* debug:start */
  //b1._total_distance += b1_pos.mag({ x: x0, y: y0, z: z0 });
  //b1._total_distance += t - t;
  //b1._total_distance = b1._last_mag;

  // TODO: This assumes a step of 1.
  //if (b1._step_iter++ % (60 * 60) === 0 && b1.name != 'sun') {
    //process._rawDebug(`[${b1_pos.x / AU},${b1_pos.y / AU},${b1_pos.z / AU}]`);
    //b1._positions[b1._pos_idx++] = b1_pos.x / AU;
    //b1._positions[b1._pos_idx++] = b1_pos.y / AU;
    //b1._positions[b1._pos_idx++] = b1_pos.z / AU;
  //}

  if (b1._step_iter++ % (60 * 60) === 0 && b1._pos_idx < b1._positions.length) {
    b1._positions[b1._pos_idx++] = b1_pos.x / AU;
    b1._positions[b1._pos_idx++] = b1_pos.y / AU;
    b1._positions[b1._pos_idx++] = b1_pos.z / AU;
  }
/* debug:stop */

  b1.acceleration().reset();
}

/* debug:start */
  //if (b1_pos.z < b1.min_z) b1.min_z = b1_pos.z;
  //if (b1_pos.z > b1.max_z) b1.max_z = b1_pos.z;
  //if (sun && b1 != sun) {
    //const a = b1.position().mag(sun.position());
    //if (a < b1.min_a) b1.min_a = a;
    //if (a > b1.max_a) b1.max_a = a;
  //}
/* debug:stop */

