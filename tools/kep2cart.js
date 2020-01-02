'use strict';

const { atan, cos, sin, sqrt, tan } = Math;

const AU = 149597870700;
const G = 6.67408e-11;
const earth_mass = 5.97237e24;
const mu = G * earth_mass;

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
  const v =  2 * atan(sqrt((1 + e) / (1 - e)) * tan(E / 2));
  const r = a * (1 - e * cos(E));
  const mu = G * M;
  const h = sqrt(mu * a / (1 - e**2));

  const X = r * (cos(Om) * cos(w + v) - sin(Om) * sin(w + v) * cos(i));
  const Y = r * (sin(Om) * cos(w + v) + cos(Om) * sin(w + v) * cos(i));
  const Z = r * (sin(i) * sin(w + v));

  const V_X = -(mu / h) * (cos(Om) * (sin(w + v) + e * sin(w)) +
                           sin(Om) * (cos(w + v) + e * cos(w)) * cos(i));
  const V_Y = -(mu / h) * (sin(Om) * (sin(w + v) + e * sin(w)) -
                           cos(Om) * (cos(w + v) + e * cos(w)) * cos(i));
  const V_Z = (mu / h) * (cos(w + v) + e * cos(w)) * sin(i);
  return [[X / AU, Y / AU, Z / AU],[V_X, V_Y, V_Z]];
}


// earths orbit:
const v = kep2cart(
  1.9885e30,
  149597887155.76578,
  0.01671022,
  d2r(1.5717062),
  d2r(102.94719),
  d2r(-11.26064),
  0,
);

console.log(v);
console.log(kep2cart(
  1.9885e30,
  778412026775.1428,
  0.04839266,
  d2r(0.3219657),
  d2r(14.75385),
  d2r(100.55615),
  0,
));
