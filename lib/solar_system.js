'use strict';

const Vector = require('./vector');
const { G } = require('./constants');

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
    for (let b1 of this[bodies_s]) {
    b1.acceleration().reset();
      for (let b2 of this[bodies_s]) {
        if (b2 === b1) {
          continue;
        }
        b1.acceleration().add(calc_acceleration(b1, b2));
      }
      // IMPORTANT: Must set position before velocity.
      b1.position().add(calc_position(b1, t));
      b1.velocity().add(calc_velocity(b1, t));
    }
  }
}

module.exports = SolarSystem;

function calc_position(b1, t) {
  const b1_vel = b1.velocity();
  const b1_acc = b1.acceleration();
  return new Vector(
    b1_vel.x * t + b1_acc.x * t**2 / 2,
    b1_vel.y * t + b1_acc.y * t**2 / 2,
    b1_vel.z * t + b1_acc.z * t**2 / 2,
  );
}

function calc_velocity(b1, t) {
  const b1_acc = b1.acceleration();
  return new Vector(
    b1_acc.x * t,
    b1_acc.y * t,
    b1_acc.z * t,
  );
}

function calc_acceleration(b1, b2) {
  const b1_pos = b1.position();
  const b2_pos = b2.position();
  const mag = b1_pos.mag(b2_pos);
  const mag_sq = mag**2;

  return new Vector(
    (-G * b2.mass / mag_sq) * ((b1_pos.x - b2_pos.x) / mag),
    (-G * b2.mass / mag_sq) * ((b1_pos.y - b2_pos.y) / mag),
    (-G * b2.mass / mag_sq) * ((b1_pos.z - b2_pos.z) / mag),
  );
}
