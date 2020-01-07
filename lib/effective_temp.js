'use strict';

const { sqrt, PI } = Math;

module.exports = { black_body_temp, temp2distance };

/**
 * T - surface temperate of the star in kelvin
 * R - radius of the star
 * D - distance of the star to the planet
 * a - albedo
 * Return - black body temperature in Celsius.
 */
function black_body_temp(T, R, D, a) {
  return T * sqrt((sqrt(1 - a) * R) / (2 * D)) - 273.15;
}

/**
 * P - black body temp of planet in Celsius
 * T - surface temp of the star
 * R - radius of the star
 * a - albedo
 * Return - distance from star in meters.
 */
function temp2distance(P, T, R, a) {
  P += 273.15;
  return sqrt(1 - a) * R * T**2 / (2 * P**2);
}
