'use strict';

const { CONSTS } = require('./constants.js');
const { DAY_SEC, YEAR_SEC, G, C } = CONSTS;
const CSQ = C**2;

module.exports = {
  orbit_period,
  rotate_main,
  rotate_second,
  grshift,
  grshift_as,
  darcsec,
  adiam,
  sec_to_string,
};

// Return the orbital period of a planet. a is the semi-major axis, M is the
// mass of the sun.
function orbit_period(a, M) {
  return 2 * Math.PI * Math.sqrt(a**3 / G / M);
}

// Rotate main coord by t degrees.
function rotate_main(a, b, t) {
  return a * Math.cos(t * Math.PI / 180) - b * Math.sin(t * Math.PI / 180);
}

// Rotate secondary coord by t degrees
function rotate_second(a, b, t) {
  return a * Math.sin(t * Math.PI / 180) + b * Math.cos(t * Math.PI / 180);
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
  return 2 * Math.atan((2 * r) / (2 * a)) * 180 / Math.PI * 3600;
}

// Return the angular diameter of an object in millimeters at distance
// a meters, with radius r meters at m meters away. Meaning, place an object
// of the returned size m meters in front of you and that's how large it is.
function adiam(a, r, m = 1) {
  return darcsec(a, r) / 3600 * Math.PI / 180 * 1000 * m;
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

  s = Math.floor(s);

  if (s === 0)
    return '00:00:00';
  outs = `${pad1(s % 60)}`;
  s = Math.floor(s / 60);
  outs = s > 0 ? `${pad1(s % 60)}:${outs}` : `00:${outs}`;
  s = Math.floor(s / 60);
  outs = s > 0 ? `${pad1(s % 24)}:${outs}` : `00:${outs}`;
  s = Math.floor(s / 24);
  return s > 0 ? `${s}:${outs}` : outs;
}
