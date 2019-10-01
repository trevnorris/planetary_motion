'use strict';

const Vector = require('./vector');
const { G } = require('./constants').CONSTS;

const pos_s = Symbol('position');
const vel_s = Symbol('velocity');
const acc_s = Symbol('acceleration');

class SystemBody {
  constructor(options) {
    this.name = options.name || '';
    this.mass = options.mass || 0;
    // Inclination to the invariable plane. The barycenter of the sun will be
    // calculated and readjusted when SolarSystem is initialized.
    this.inclination = options.inclination || 0;
    this.radius = options.radius || 0;
    this[pos_s] = new Vector();
    this[vel_s] = new Vector();
    this[acc_s] = new Vector();

    // Use inclination to set initial position.
    const dist = options.distance || 0;
    this[pos_s].x = dist;

    //this[pos_s].x = dist * Math.cos(this.inclination * Math.PI / 180);
    //this[pos_s].y = dist * Math.sin(this.inclination * Math.PI / 180);

    // Set initial velocity.
    // TODO: Double check this adjustment leads to the correct orbit.
    const vel = options.velocity || 0;
    //this[vel_s].y = vel * Math.cos(this.inclination * Math.PI / 180);
    //this[vel_s].z = vel * Math.sin(this.inclination * Math.PI / 180);
    this[vel_s].y = vel
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
