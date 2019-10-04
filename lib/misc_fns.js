'use strict';

const { CONSTS } = require('./constants.js');
const { DAY_SEC, YEAR_SEC, G, C } = CONSTS;
const CSQ = C**2;

module.exports = {
  pshift,
  pshift_c,
  gtdilation,
  sec_to_string,
};

/* Calculate the perihelion shift due to gravity in arc seconds using a
 * planet's eccentricity and semi-major axis, and the sun's mass.
 *
 * This is reduced from:
 *
 *           24π³a²
 *    σ = ------------
 *         T²c²(1-e²)
 *
 * T - orbital period
 * e - eccentricity
 * a - distance between centers of mass
 *              ____
 *             / a³ `
 *    T = 2π\ / ----
 *           V   GM
 *
 * Replacing T in σ and reducing we get:
 *
 *            6πGM
 *    σ = -----------
 *         (1-e²)ac²
 *
 * Which is the perihelion shift per orbit in radian. The reduced equation
 * after converting to arc seconds is:
 *
 *         3888000GM
 *    σ = -----------
 *         (1-e²)ac²
 *
 */
function pshift(a, M, e) {
  return 3.888e6 * G * M / ((1 - e**2) * a * CSQ);
}

// Calculate the perihelion shift in arc seconds per centry where P is the
// period orbit in earth days.
function pshift_c(a, M, e, P) {
  return pshift(a, M, e) * (YEAR_SEC / (P * DAY_SEC)) * 100;
}

/* Calculate the gravitational time dilation for the orbiting body. The general
 * calculation is:
 *
 *                t
 *         _______________
 *    t` =      _________
 *             /    2GM  `
 *          \ /1 - -----
 *           V      rc²
 *
 * but in the following function we're solving for t.
 */
function gtdilation(tp, a, M) {
  return tp * Math.sqrt(1 - 2 * G * M / (a * CSQ));
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
