'use strict';

const Vector = require('./vector');
const { G } = require('./constants').CONSTS;

const bodies_s = Symbol('bodies_list');

class SolarSystem {
  constructor(bodies) {
    this[bodies_s] = Array.isArray(bodies) ? bodies.slice() : [];
  }

  add_body(b) {
    this[bodies_s].push(b);
    return this;
  }

  bodies() {
    return this[bodies_s].slice();
  }

  step(t) {
    const len = this[bodies_s].length;
    for (let i = 0; i < len; i++) {
      this[bodies_s][i].acceleration().reset();
    }
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        add_acceleration(this[bodies_s][i], this[bodies_s][j]);
      }
      add_position_velocity(this[bodies_s][i], t);
    }
    return this;
  }
}

module.exports = SolarSystem;


function add_acceleration(b1, b2) {
  const b1_pos = b1.position();
  const b2_pos = b2.position();
  const b1_acc = b1.acceleration();
  const b2_acc = b2.acceleration();
  const rsq = b1_pos.mag_sq(b2_pos);
  const r = 1 / Math.sqrt(rsq);
  let Fg;

  Fg = -G * b2.mass / rsq;
  b1_acc.x += Fg * (b1_pos.x - b2_pos.x) * r;
  b1_acc.y += Fg * (b1_pos.y - b2_pos.y) * r;
  b1_acc.z += Fg * (b1_pos.z - b2_pos.z) * r;

  Fg = -G * b1.mass / rsq;
  b2_acc.x += Fg * (b2_pos.x - b1_pos.x) * r;
  b2_acc.y += Fg * (b2_pos.y - b1_pos.y) * r;
  b2_acc.z += Fg * (b2_pos.z - b1_pos.z) * r;
}

function add_position_velocity(b1, t) {
  const b1_pos = b1.position();
  const b1_vel = b1.velocity();
  const b1_acc = b1.acceleration();
  const t_sq = t**2;
  b1_pos.x += b1_vel.x * t + b1_acc.x * t_sq / 2;
  b1_pos.y += b1_vel.y * t + b1_acc.y * t_sq / 2;
  b1_pos.z += b1_vel.z * t + b1_acc.z * t_sq / 2;
  b1_vel.x += b1_acc.x * t;
  b1_vel.y += b1_acc.y * t;
  b1_vel.z += b1_acc.z * t;
}
