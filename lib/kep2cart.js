'use strict';

const { atan, cos, sin, sqrt, tan } = Math;
const { G, C, AU } = require('./constants').CONSTS;

module.exports = kep2cart;

function d2r(n) {
  return n * Math.PI / 180;
}

/**
 * M - mass of orbited body
 * a - semi-major axis
 * e - eccentricity
 * i - inclination
 * w - argument of periapsis (ω)
 * Om - longitude of ascending node (ω or Ω)
 * E - eccentric anomaly < 2π, angle of point P if orbit of P was a circle.
 * v - true anomaly (ν, θ, or f)
 * r - radius; distance from the focus to point P
 * h - angular momentum
 */
function kep2cart(M, a, e, i, w, Om, E) {
  i = d2r(i);
  w = d2r(w);
  Om = d2r(Om);
  const v = 2 * atan(sqrt((1 + e) / (1 - e)) * tan(E / 2));
  const r = a * (1 - e * cos(E));
  const mu = G * M;
  const h = sqrt(mu * a / (1 - e**2));

  const x = r * (cos(Om) * cos(w + v) - sin(Om) * sin(w + v) * cos(i));
  const y = r * (sin(Om) * cos(w + v) + cos(Om) * sin(w + v) * cos(i));
  const z = r * (sin(i) * sin(w + v));

  const v_x = -(mu / h) * (cos(Om) * (sin(w + v) + e * sin(w)) +
                           sin(Om) * (cos(w + v) + e * cos(w)) * cos(i));
  const v_y = -(mu / h) * (sin(Om) * (sin(w + v) + e * sin(w)) -
                           cos(Om) * (cos(w + v) + e * cos(w)) * cos(i));
  const v_z = (mu / h) * (cos(w + v) + e * cos(w)) * sin(i);
  return [{ x, y, z }, { x: v_x, y: v_y, z: v_z }];
}
