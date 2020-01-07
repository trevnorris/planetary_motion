'use strict';

const { atan, cos, floor, log10, sin, sqrt, PI } = Math;
const { CONSTS, SUN } = require('./constants.js');
const { DAY_SEC, YEAR_SEC, G, C } = CONSTS;
const CSQ = C**2;

module.exports = {
  orbit_period,
  orbit_period_days,
  star_to_period,
  calc_lum,
  gen_star,
  rotate_main,
  rotate_second,
  grshift,
  grshift_as,
  darcsec,
  adiam,
  sec_to_string,
  relative_mag,
};

// Return the orbital period of a planet. a is the semi-major axis, M is the
// mass of the sun.
function orbit_period(a, M) {
  return 2 * PI * sqrt(a**3 / G / M);
}

function orbit_period_days(a, M) {
  return orbit_period(a, M) / DAY_SEC;
}

/**
 * M - mass of star
 * R - radius of the star
 * T - surface temp of the star
 * P - black body temp of planet in Celsius
 * A - albedo
 * Returns orbit period in seconds
 */
function star_to_period(M, R, T, P, A) {
  P += 273.15;
  // calculated semi-major axis of the planet's orbit.
  const a = sqrt(1 - A) * R * T**2 / (2 * P**2);
  return orbit_period(a, M);
}

// Calculate luminosity of a star given its radius and temperature.
function calc_lum(radius, temp) {
  return CONSTS.STEFAN_BOLTZMANN * 4 * PI* radius**2 * temp**4;
}

// Generate a star's information with basic parameters.
// mass is in kg, radius is in meters, temp is in kelvin
function gen_star(mass, radius, temp) {
  const luminosity = calc_lum(radius, temp);
  const abs_mag = -2.5 * log10(luminosity, CONSTS.ZERO_POINT_LUMINOSITY);
  return {
    mass,
    radius,
    temp,
    luminosity,
    stellar_luminosity: luminosity / SUN.LUMINOSITY,
    abs_mag,
  };
}

// Rotate main coord by t degrees.
function rotate_main(a, b, t) {
  return a * cos(t * PI / 180) - b * sin(t * PI / 180);
}

// Rotate secondary coord by t degrees
function rotate_second(a, b, t) {
  return a * sin(t * PI / 180) + b * cos(t * PI / 180);
}

/* Calculate the perihelion shift explained by general relativity in arc
 * seconds using a planet's eccentricity and semi-major axis, and the sun's
 * mass.
 *
 * This is reduced from:
 *
 *           24π³a²
 *    σ = ------------
 *         T²c²(1-e²)
 *
 * T - orbital period
 * e - eccentricity
 * a - semi-major axis
 *              ____
 *             / a³ `
 *    T = 2π\ / ----
 *           V   GM
 *
 * Replacing T and reducing we get:
 *
 *            6πGM
 *    σ = -----------
 *         (1-e²)ac²
 *
 * Which is the perihelion shift per orbit in radians. The reduced equation
 * after converting to arc seconds is:
 *
 *         3888000GM
 *    σ = -----------
 *         (1-e²)ac²
 *
 */
function grshift(a, M, e) {
  return 3.888e6 * G * M / ((1 - e**2) * a * CSQ);
}

/* Calculate the perihelion shift in arc seconds per centry a is the
 * semi-major axis, M is the mass of the sun and e is the eccentricity.
 */
function grshift_as(a, M, e) {
  return grshift(a, M, e) * YEAR_SEC / orbit_period(a, M);
}

// Return the diameter of a planet in arc seconds using distance and radius.
function darcsec(a, r) {
  return 2 * atan((2 * r) / (2 * a)) * 180 / PI * 3600;
}

// Return the angular diameter of an object in millimeters at distance
// "a" meters, with radius "r" meters at "m" meters away.
function adiam(a, r, m = 1) {
  return darcsec(a, r) / 3600 * PI / 180 * 1000 * m;
}

// M - absolute magnitude
// D - distance from star
function relative_mag(M, D) {
  return M - 5 + 5 * log10(D);
}

function pad1(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

// Return seconds in an HH:MM:SS format
function sec_to_string(s) {
  let sec = 0;
  let min = 0;
  let hour = 0;
  let day = 0;
  let outs = '';

  s = floor(s);

  if (s === 0)
    return '00:00:00';
  outs = `${pad1(s % 60)}`;
  s = floor(s / 60);
  outs = s > 0 ? `${pad1(s % 60)}:${outs}` : `00:${outs}`;
  s = floor(s / 60);
  outs = s > 0 ? `${pad1(s % 24)}:${outs}` : `00:${outs}`;
  s = floor(s / 24);
  return s > 0 ? `${s}:${outs}` : outs;
}
