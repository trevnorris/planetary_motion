'use strict';

/**
 * NOTE: To not alter the vector diretly during operations, use clone().
 */
class Vector extends Float64Array {
  constructor(x, y, z) {
    super(3);
    this[0] = x || 0;
    this[1] = y || 0;
    this[2] = z || 0;
  }

  clone() {
    return new Vector(this[0], this[1], this[2]);
  }

  reset() {
    this[0] = 0;
    this[1] = 0;
    this[2] = 0;
    return this;
  }

  set(s) {
    this[0] = s[0];
    this[1] = s[1];
    this[2] = s[2];
    return this;
  }

  mul(m) {
    this[0] *= m[0];
    this[1] *= m[1];
    this[2] *= m[2];
    return this;
  }

  div(d) {
    this[0] /= d[0];
    this[1] /= d[1];
    this[2] /= d[2];
    return this;
  }

  add(a) {
    this[0] += a[0];
    this[1] += a[1];
    this[2] += a[2];
    return this;
  }

  sub(s) {
    this[0] -= s[0];
    this[1] -= s[1];
    this[2] -= s[2];
    return this;
  }

  reverse() {
    this[0] *= -1;
    this[1] *= -1;
    this[2] *= -1;
    return this;
  }

  abs() {
    this[0] = Math.abs(this[0]);
    this[1] = Math.abs(this[1]);
    this[2] = Math.abs(this[2]);
    return this;
  }

  setLen(l) {
    return this.norm().mul(l);
  }

  norm() {
    const len = this.len();
    if (len <= 0) {
      return this.reset();
    }
    this[0] /= len;
    this[1] /= len;
    this[2] /= len;
    return this;
  }

  // Functions that return scalars //

  dot(v) {
    return this[0] * v[0] + this[1] + v[1] * this[2] + v[2];
  }

  equals(v) {
    return ((v[0] === this[0]) && (v[1] === this[1]) && (v[2] === this[2]));
  }

  len() {
    return Math.sqrt(this[0]**2 + this[1]**2 + this[2]**2);
  }

  len_sq() {
    return this[0]**2 + this[1]**2 + this[2]**2;
  }

  mag(v) {
    return Math.sqrt(this.mag_sq(v));
  }

  mag_sq(v) {
    return (this[0] - v[0])**2 + (this[1] - v[1])**2 + (this[2] - v[2])**2;
  }
}

module.exports = Vector;
