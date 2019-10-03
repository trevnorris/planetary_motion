'use strict';

const Vector = require('./vector');
const { G } = require('./constants').CONSTS;

const pos_s = Symbol('position');
const vel_s = Symbol('velocity');
const acc_s = Symbol('acceleration');

class SystemBody {
  constructor(options) {
    // TODO: Add error checking.
    this.name = options.name;
    this.mass = options.mass;
    this.radius = options.radius;
    // The set of initial conditions.
    const inic = this.inicon = {
      // Inclination to the invariable plane. The barycenter of the sun will be
      // calculated and readjusted when SolarSystem is initialized.
      inclination: options.inclination || 0,
      eccentricity: options.eccentricity || 0,
      semi_major: options.semi_major || 0,
      aphelion: options.semi_major * (1 + options.eccentricity),
    };

    // Set initial position at the aphelion.
    this[pos_s] = new Vector(inic.aphelion, 0, 0);
    // Initial velocity will be set in SolarSystem#init().
    this[vel_s] = new Vector();
    this[acc_s] = new Vector();

/* debug:start */
this.options = options;
this.min_z = Infinity;
this.max_z = -Infinity;
this.min_a = Infinity;
this.max_a = -Infinity;
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
