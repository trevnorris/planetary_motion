'use strict';

const { sqrt, PI } = Math;

module.exports = { black_body, temp2distance };

/**
 * T - surface temperate of the star
 * R - radius of the star
 * D - distance of the star to the planet
 * a - albedo
 * returns temp in celsius
 */
function black_body(T, R, D, a) {
  return T * sqrt((sqrt(1 - a) * R) / (2 * D)) - 273.15;
}

/**
 * P - black body temp of planet
 * T - surface temp of the star
 * R - radius of the star
 * a - albedo
 */
function temp2distance(P, T, R, a) {
  return sqrt(1 - a) * R * T**2 / (2 * P**2);
}
