'use strict';

const G = 6.67408e-11;  // Gravitational constant

const Vector = require('./vector.js');
const { get_xyz } = require('./utils.js');
const xyz = [0, 0, 0];

class Planet {
  constructor() {
    this._velocity = new Vector();
    this._coord = [0, 0, 0];  // Coordinates in meters of [x, y, z]
    this.mass = 1;            // Mass in kg
    this.radius = 1;          // Radius in meters
  }

  reset() {
    this._velocity.reset();
    this._coord[0] = 0;
    this._coord[1] = 0;
    this._coord[2] = 0;
    this.mass = 1;
    this.radius = 1;
    return this;
  }

  set_velocity(s) {
    this._velocity.set(s);
    return this;
  }

  set_coord(p) {
    get_xyz(p, xyz);
    this._coord[0] = xyz[0];
    this._coord[1] = xyz[1];
    this._coord[2] = xyz[2];
    return this;
  }

  set_mass(m) {
    this.mass = m;
    return this;
  }

  set_radius(r) {
    this.radius = r;
    return this;
  }

  // Update the velocity using G*m*t/r**2, where r is the distance between the
  // two bodies.
  update_vel(v) {
    //this._velocity.add(v);
    return this;
  }

  // Proceed t seconds forward based on current velocity.
  step(t) {
    // Add current position with sec * current velocity.
  }

  // Return the velocity of the Planet as an array [x, y, z].
  vel() {
    return [this._velocity.x, this._velocity.y, this._velocity.z];
  }

  // Return the coordinates of the Planet as an array [x, y, z].
  coord() {
    return [this._coord[0], this._coord[1], this._coord[2]];
  }
}

module.exports = Planet;
