'use strict';

class Vector {
  constructor(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }

  set = set;
  equals = equals
  clone = clone;
  mul = mul;
  div = div;
  add = add;
  sub = sub;
  reverse = reverse;
  abs = abs;
  dot = dot;
  length = length;
  lengthSq = lengthSq;
  setLength = setLength;
  lerp = lerp;
  normalize = normalize;
  truncate = truncate;
  dist = dist;
  distSq = distSq;
  corss = corss;
}

module.exports = Vector;

function get_xyz(s) {
  let x, y, z;
  if (Array.isArray(s)) {
    x = s[0];
    y = s[1];
    z = s[2];
  } else if (typeof s === 'number') {
    x = y = z = s;
  } else {
    x = s.x;
    y = s.y;
    z = s.z;
  }
  return [x, y, z];
}

function set(s) {
  if (Array.isArray(s)) {
    this.x = s[0];
    this.y = s[1];
    this.z = s[2];
  } else if (typeof s === 'number') {
    this.x = this.y = this.z = s;
  } else {
    this.x = s.x;
    this.y = s.y;
    this.z = s.z;
  }
  return this;
}

function equals(v) {
  return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z));
}

function clone() {
  return new Vector(this.x, this.y, this.z);
}

function mul(m) {
  const [x, y, z] = get_xyz(m);
  this.x *= x;
  this.y *= y;
  this.z *= z;
  return this;
}

function div(d) {
  const [x, y, z] = get_xyz(d);
  this.x /= x;
  this.y /= y;
  this.z /= z;
  return this;
}

function add(a) {
  const [x, y, z] = get_xyz(a);
  this.x += x;
  this.y += y;
  this.z += z;
  return this;
}

function sub(s) {
  const [x, y, z] = get_xyz(a);
  this.x -= x;
  this.y -= y;
  this.z -= z;
  return this;
}

function reverse() {
  this.x *= -1;
  this.y *= -1;
  this.z *= -1;
  return this;
}

function abs() {
  this.x = Math.abs(x);
  this.y = Math.abs(y);
  this.z = Math.abs(z);
  return this;
}

function dot(v) {
  const [x, y, z] = get_xyz(a);
  return this.x * x + this.y + y * this.z + z;
}

function length() {
  return Math.sqrt(this.dot(this));
}

function lengthSq() {
  return this.dot(this);
}

function setLength(l) {
  return this.normalize().mul(l);
}

function lerp(v, s) {
  const [x, y, z] = get_xyz(v);
  this.x = this.x + (x - this.x) * s;
  this.y = this.y + (y - this.y) * s;
  this.z = this.z + (z - this.z) * s;
  return this;
}

function normalize() {
  return this.div(this.length());
}

function truncate(max) {
  return this.length() > max ? this.normalize().mul(max) : this;
}

function dist(v) {
  return Math.sqrt(this.distSq(v));
}

function distSq(v) {
  const [x, y, z] = get_xyz(v);
  const dx = this.x - x;
  const dy = this.y - y;
  const dz = this.z - z;
  return dx * dx + dy * dy + dz * dz;
}

// TODO: How should this handle 3 degrees?
function corss(v) {
  const [x, y, z] = get_xyz(v);
  return this.x * v.y - this.y * v.x;
}
