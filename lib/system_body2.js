'use strict';

const Vector = require('./vector');
const { G } = require('./constants').CONSTS;

const pos_s = Symbol('position');
const vel_s = Symbol('velocity');
const acc_s = Symbol('acceleration');
const mag_s = Symbol('last_sun_mag');

class SystemBody {
  constructor(options) {
    // TODO: Add error checking.
    this.name = options.name;
    this.mass = options.mass;
    this.radius = options.radius;
    this._last_mag = 0;
    this._last_alphelion = -Infinity;
    this._last_alphelion_coord = new Vector();
    this._last_perihelion = Infinity;
    this._last_perihelion_coord = new Vector();
    this._to_alphelion = false;
    // The set of initial conditions.
    const inic = this.inicon = {
      // Inclination to the invariable plane. The barycenter of the sun will be
      // calculated and readjusted when SolarSystem is initialized.
      inclination: options.inclination || 0,
      eccentricity: options.eccentricity || 0,
      semi_major: options.semi_major || 0,
      aphelion: options.semi_major * (1 + options.eccentricity),
      // This is an array vector of the [x, y, z] position of the planet's
      // starting position.
      position: options.position || null,
    };

    // Initial position will be set in SolarSystem#init() depending on whether
    // position was given or not.
    this[pos_s] = new Vector(options.aphelion, 0, 0);
    // Initial velocity will be set in SolarSystem#init().
    this[vel_s] = new Vector();
    this[acc_s] = new Vector();
    this[mag_s] = 0;

/* debug:start */
//this.options = options;
//this.min_z = Infinity;
//this.max_z = -Infinity;
//this.min_a = Infinity;
//this.max_a = -Infinity;
/* debug:stop */
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
