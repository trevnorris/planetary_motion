'use strict';

/**
 * NOTE: To not alter the vector diretly during operations, use clone().
 */
class Vector {
  constructor(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }

  clone() {
    return new Vector(this.x, this.y, this.z);
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    return this;
  }

  set_s(n) {
    this.x = n;
    this.y = n;
    this.z = n;
    return this;
  }

  set(s) {
    this.x = s.x;
    this.y = s.y;
    this.z = s.z;
    return this;
  }

  mul_s(n) {
    this.x *= n;
    this.y *= n;
    this.z *= n;
    return this;
  }

  mul(m) {
    this.x *= m.x;
    this.y *= m.y;
    this.z *= m.z;
    return this;
  }

  div_s(n) {
    this.x /= n;
    this.y /= n;
    this.z /= n;
    return this;
  }

  div(d) {
    this.x /= d.x;
    this.y /= d.y;
    this.z /= d.z;
    return this;
  }

  add_s(n) {
    this.x += n;
    this.y += n;
    this.z += n;
    return this;
  }

  add(a) {
    this.x += a.x;
    this.y += a.y;
    this.z += a.z;
    return this;
  }

  sub_s(n) {
    this.x -= n;
    this.y -= n;
    this.z -= n;
    return this;
  }

  sub(s) {
    this.x -= s.x;
    this.y -= s.y;
    this.z -= s.z;
    return this;
  }

  reverse() {
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;
    return this;
  }

  abs() {
    this.x = Math.abs(x);
    this.y = Math.abs(y);
    this.z = Math.abs(z);
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
    this.x /= len;
    this.y /= len;
    this.z /= len;
    return this;
  }

  cross(v) {
    const { x, y, z } = this;
    this.x = y * v.z - z * v.y;
    this.y = z * v.x - x * v.z;
    this.z = x * v.y - y * v.x;
    return this;
  }

  pow(n) {
    this.x = this.x**n;
    this.y = this.y**n
    this.z = this.z**n;
    return this;
  }

  // Functions that return scalars //

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  equals(v) {
    return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z));
  }

  len() {
    return Math.sqrt(this.x**2 + this.y**2 + this.z**2);
  }

  len_sq() {
    return this.x**2 + this.y**2 + this.z**2;
  }

  mag(v) {
    return Math.sqrt(this.mag_sq(v));
  }

  mag_sq(v) {
    return (this.x - v.x)**2 + (this.y - v.y)**2 + (this.z - v.z)**2;
  }

  angle(v) {
    return Math.acos(this.dot(v) / (this.len() * v.len()));
  }

  angle_b(v, b) {
    return Math.acos(this.dot(v) / (this.mag(b) * v.mag(b)));
  }
}

module.exports = Vector;
