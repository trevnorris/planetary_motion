'use strict';

const Vector = require('./vector');
const { G } = require('./constants');

const pos_s = Symbol('position');
const vel_s = Symbol('velocity');
const acc_s = Symbol('acceleration');

class SystemBody {
  constructor(name, mass, pos, vel, acc) {
    this.name = name || '';
    this.mass = mass || 1;
    this[pos_s] = pos instanceof Vector ? pos.clone() : new Vector();
    this[vel_s] = vel instanceof Vector ? vel.clone() : new Vector();
    this[acc_s] = acc instanceof Vector ? acc.clone() : new Vector();
  }

  set_name(n) {
    this.name = n;
    return this;
  }

  set_mass(m) {
    this.mass = m;
    return this;
  }

  position() {
    return this[pos_s];
  }

  velocity() {
    return this[vel_s];
  }

  acceleration() {
    return this[acc_s];
  }
}

module.exports = SystemBody;
