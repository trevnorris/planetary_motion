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
    for (let i = 0; i < this[bodies_s].length; i++) {
      const b1 = this[bodies_s][i];
      b1.acceleration().reset();
      for (let j = 0; j < this[bodies_s].length; j++) {
        const b2 = this[bodies_s][j];
        // TODO(trevnorris): Using 100000 is arbitrary. Come up w/ better value.
        if (b2 === b1) {
          continue;
        }
        add_acceleration(b1, b2);
      }
      // IMPORTANT: Must set position before velocity.
      add_position(b1, t);
      add_velocity(b1, t);
    }
  }
}

module.exports = SolarSystem;


function add_position(b1, t) {
  const b1_pos = b1.position();
  const b1_vel = b1.velocity();
  const b1_acc = b1.acceleration();
  const t_sq = t**2;
  b1_pos.x += b1_vel.x * t + b1_acc.x * t_sq / 2;
  b1_pos.y += b1_vel.y * t + b1_acc.y * t_sq / 2;
  b1_pos.z += b1_vel.z * t + b1_acc.z * t_sq / 2;
}

function add_velocity(b1, t) {
  const b1_vel = b1.velocity();
  const b1_acc = b1.acceleration();
  b1_vel.x += b1_acc.x * t;
  b1_vel.y += b1_acc.y * t;
  b1_vel.z += b1_acc.z * t;
}

function add_acceleration(b1, b2) {
  const b1_pos = b1.position();
  const b2_pos = b2.position();
  const b1_acc = b1.acceleration();
  const mag = b1_pos.mag(b2_pos);
  const mag_sq = mag**2;
  b1_acc.x += (-G * b2.mass / mag_sq) * ((b1_pos.x - b2_pos.x) / mag);
  b1_acc.y += (-G * b2.mass / mag_sq) * ((b1_pos.y - b2_pos.y) / mag);
  b1_acc.z += (-G * b2.mass / mag_sq) * ((b1_pos.z - b2_pos.z) / mag);
}
