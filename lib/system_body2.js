'use strict';

const Vector = require('./vector');
const { G } = require('./constants').CONSTS;
const { rotate_main, rotate_second } = require('./misc_fns');

const pos_s = Symbol('position');
const vel_s = Symbol('velocity');
const acc_s = Symbol('acceleration');
const mag_s = Symbol('last_sun_mag');

class SystemBody {
  constructor(options) {
    if (!options.semi_major) {
      options.semi_major = 0;
    }
    if (!options.eccentricity) {
      options.eccentricity = 0;
    }

    // TODO: Add error checking.
    this.name = options.name;
    this.mass = options.mass;
    this.radius = options.radius;
    this.sun = options.sun || null;
    this._last_mag = 0;
    this._to_alphelion = false;
    this._total_distance = 0;
    // The set of initial conditions.
    const inic = this.inicon = {
      // Inclination to the invariable plane. The barycenter of the sun will be
      // calculated and readjusted when SolarSystem is initialized.
      eccentricity: options.eccentricity || 0,
      inclination: options.inclination || 0,
      semi_major: options.semi_major || 0,
      aphelion: options.semi_major * (1 + options.eccentricity),
      perihelion: options.semi_major * (1 - options.eccentricity),
      periapsis_arg: options.periapsis_arg || 0,
      ascending_node: options.ascending_node || 0,
    };
    this._last_alphelion = inic.aphelion;
    this._last_alphelion_coord = new Vector(inic.aphelion, 0, 0);
    this._last_perihelion = inic.perihelion;
    this._last_perihelion_coord = new Vector(-inic.perihelion, 0, 0);
    // This gives ~500 years of positions for every hour.
    this._positions = new Float64Array(3 * 365 * 24 * 500);
    this._pos_idx = 0;
/* debug:start */
this._cum_acc = 0;
this._step_iter = 0;
/* debug:stop */

    // Initial position will be set in SolarSystem#init() depending on whether
    // position was given or not.
    this[pos_s] = new Vector(
      rotate_main(inic.perihelion, 0, inic.periapsis_arg),
      rotate_second(inic.perihelion, 0, inic.periapsis_arg),
      0);
    // TODO(trevnorris): Use ascending_node to adjust the y,z of the position
    // given that position of the perihelion.

    const M = this.sun !== null ? this.sun.mass : 0;
    // Velocity at the perihelion.
    const peri_vel =
      Math.sqrt(G * M * (2 / inic.perihelion - 1 / inic.semi_major));
    // First rotate initial velocity for periapsis_arg.
    this[vel_s] = new Vector(
      rotate_second(peri_vel, 0, 360 - inic.periapsis_arg),
      rotate_main(peri_vel, 0, 360 - inic.periapsis_arg),
      0);
    // Then rotate due to ascending node.
    this[vel_s].y = rotate_main(this[vel_s].y, 0, inic.inclination);
    this[vel_s].z = rotate_second(this[vel_s].y, 0, inic.inclination);

    this[acc_s] = new Vector();
    this[mag_s] = 0;

    if (this.sun !== null)
      this._last_mag = this[pos_s].mag(this.sun);

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
