'use strict';

const { sqrt } = Math;
const Vector = require('./vector');
const { G } = require('./constants').CONSTS;
const kep2cart = require('./kep2cart');

const add_satellite_fn = Symbol('add_satellite');
const remove_satellite_fn = Symbol('remove_satellite');
const calc_acc_fn = Symbol('calc_acc');
const calc_pos_vel_fn = Symbol('calc_pos_vel');

class SystemBody {
  constructor(name, mass, radius) {
    this.name_ = name;
    this.mass_ = mass;
    this.radius_ = radius;
    this.pos_ = new Vector();
    this.vel_ = new Vector();
    this.acc_ = new Vector();
    this.orbiting_ = null;
    this.satellites_ = [];
  }

  name() { return this.name_; }
  mass() { return this.mass_; }
  radius() { return radius_; }
  orbiting() { return this.orbiting_; }
  pos() { return this.pos_; }
  vel() { return this.vel_; }
  acc() { return this.acc_; }
  // Distance to orbiting body.
  mag() { return this.pos_.mag(this.orbiting_.pos()); }

  /**
   * Structure of k (keplar values):
   * M - mass of orbited body
   * a - semi-major axis
   * e - eccentricity
   * i - inclination
   * w - argument of periapsis (ω)
   * Om - longitude of ascending node (ω or Ω)
   * E - eccentric anomaly < 2π, angle of point P if orbit of P was a circle.
   */
  set_orbit(body, k) {
    const [pos_a, vel_a] = kep2cart(k.M, k.a, k.e, k.i, k.w, k.Om, k.E);
    this.pos_.set(pos_a);
    this.vel_.set(vel_a);
    this.orbiting_ = body;
    this.keplar_ = k;
    body[add_satellite_fn](this);
    // TODO(trevnorris): Fix altering orbiting position/velocity when the
    // orbited planet changes position.
    for (let satellite of this.satellites_) {
      satellite.set_orbit(this.orbiting_, this.keplar_);
    }
    return this;
  }

  [add_satellite_fn](body) {
    if (!this.satellites_.includes(body))
      this.satellites_.push(body);
  }

  [remove_satellite_fn](body) {
    this.satellites_.filter(e => e === body);
  }

  // bodies should be an Array of bodies that'll be calculated over.
  [calc_acc_fn](bodies) {
    this.acc_.reset();
    for (let body of bodies) {
      if (body === this)
        continue;
      add_acceleration(this, body);
    }
  }

  // t is the time in seconds.
  [calc_pos_vel_fn](t) {
    add_position_velocity(this, t);
  }
}

function add_acceleration(b1, b2) {
  const b1pos = b1.pos();
  const b2pos = b2.pos();
  const b1acc = b1.acc();
  const rsq = b1pos.mag_sq(b2pos);
  const Fg = -G * b2.mass() / rsq / sqrt(rsq);
  b1acc.x += Fg * (b1pos.x - b2pos.x);
  b1acc.y += Fg * (b1pos.y - b2pos.y);
  b1acc.z += Fg * (b1pos.z - b2pos.z);
}

function add_position_velocity(b1, t) {
  const b1pos = b1.pos();
  const b1vel = b1.vel();
  const b1acc = b1.acc();
  const t_sq2 = t**2 / 2;
  b1pos.x += b1vel.x * t + b1acc.x * t_sq2;
  b1pos.y += b1vel.y * t + b1acc.y * t_sq2;
  b1pos.z += b1vel.z * t + b1acc.z * t_sq2;
  b1vel.x += b1acc.x * t;
  b1vel.y += b1acc.y * t;
  b1vel.z += b1acc.z * t;
}


class System {
  constructor() {
    this.bodies_ = [];
  }

  bodies() { return this.bodies_; }

  add_body(body) {
    if (!this.bodies_.includes(body))
      this.bodies_.push(body);
    return this;
  }

  step(t) {
    for (let body of this.bodies_) {
      body[calc_acc_fn](this.bodies_);
    }
    for (let body of this.bodies_) {
      body[calc_pos_vel_fn](t);
    }
    return this;
  }
}


module.exports = { SystemBody, System };
