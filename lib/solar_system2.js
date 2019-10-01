'use strict';

const Vector = require('./vector');
const { G } = require('./constants').CONSTS;

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
    // Assume sun has position of [0,0,0]
    let bc_m = this[sun_s].mass;
    let bc_p = new Vector();
    // Calculate all m1 * x1 + ...
    for (let b of this[bodies_s]) {
      const pos = b.position().clone();
      bc_m += b.mass;
      bc_p.add(pos.mul_s(b.mass));
    }
    // Calculate barycenter.
    bc_p.div_s(bc_m);
    // Adjust positions of planets and sun to place barycenter at [0,0,0].
    this[sun_s].position().sub(bc_p);
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
    const len = this[bodies_s].length;
    for (let i = 0; i < len; i++) {
      const b1 = this[bodies_s][i];
      b1.acceleration().reset();
      for (let j = i + 1; j < len; j++) {
        add_acceleration(b1, this[bodies_s][j]);
      }
      add_position_velocity(b1, t);
    }
    return this;
  }
}

module.exports = SolarSystem;


function add_position_velocity(b1, t) {
  const b1_pos = b1.position();
  const b1_vel = b1.velocity();
  const b1_acc = b1.acceleration();
  const t_sq = t**2 / 2;
  b1_pos.x += b1_vel.x * t + b1_acc.x * t_sq;
  b1_pos.y += b1_vel.y * t + b1_acc.y * t_sq;
  b1_pos.z += b1_vel.z * t + b1_acc.z * t_sq;
  b1_vel.x += b1_acc.x * t;
  b1_vel.y += b1_acc.y * t;
  b1_vel.z += b1_acc.z * t;
}

function add_acceleration(b1, b2) {
  const b1_pos = b1.position();
  const b2_pos = b2.position();
  const b1_acc = b1.acceleration();
  const b2_acc = b2.acceleration();
  const mag = b1_pos.mag(b2_pos);
  const mag_sq = mag**2;

  let pre = -G * b2.mass / mag_sq;
  b1_acc.x += pre * ((b1_pos.x - b2_pos.x) / mag);
  b1_acc.y += pre * ((b1_pos.y - b2_pos.y) / mag);
  b1_acc.z += pre * ((b1_pos.z - b2_pos.z) / mag);

  pre = -G * b1.mass / mag_sq;
  b2_acc.x += pre * ((b2_pos.x - b1_pos.x) / mag);
  b2_acc.y += pre * ((b2_pos.y - b1_pos.y) / mag);
  b2_acc.z += pre * ((b2_pos.z - b1_pos.z) / mag);
}

