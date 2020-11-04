'use strict';

const { log10, sqrt, PI } = Math;
const {
  calc_lum,
  calc_aphelion,
  calc_perihelion,
  calc_orbit_period,
  calc_mean_speed,
  gen_star,
} = require('./equations.js');

/**
 * All unites of measurement are either kilograms, kilometers, meters/sec
 */

const CONSTS = {
  C: 299792458,                     // m⋅s⁻¹
  G: 6.67428e-11,                   // N⋅m²⋅kg⁻² OR m³⋅kg⁻¹⋅s⁻²
  GM: 1.32712440041e20,             // m³⋅s⁻²
  AU: 149597870.7,                  // km
  DAY_SEC: 86400,                   // one day in seconds
  YEAR_DAY: 365.256363004,          // days in one sidereal year
  YEAR_SEC: 365.256363004 * 86400,  // seconds in a year
  STEFAN_BOLTZMANN: 5.670374419e-8, // W⋅m⁻²⋅K⁻⁴
  ZERO_POINT_LUMINOSITY: 3.0128e28, // Watts
}

const SUN = {
  MASS: 1.98847e30,
  RADIUS: 696342,
  TEMP: 5778,
  LUMINOSITY: calc_lum(696342, 5778),
};

// The value of AU above was used to convert the distances.
// INCLINATION is on the invariable plane.
// SEMI_MAJOR has been corrected to match the orbital period.

const MERCURY = {
  MASS: 3.3011e23,
  RADIUS: 2439.7,
  SEMI_MAJOR: CONSTS.AU * 0.3870973,
  ECCENTRICITY: 0.20563069,
  INCLINATION: 6.3472876,
  PERIAPSIS_ARG: 77.45645,  // Argument of periapsis
  ASCENDING_NODE: 48.33167, // Longitude of ascending node
};

const VENUS = {
  MASS: 4.8675e24,
  RADIUS: 6051.8,
  SEMI_MAJOR: CONSTS.AU * 0.723331,
  ECCENTRICITY: 0.00677323,
  INCLINATION: 2.1545480,
  PERIAPSIS_ARG: 131.53298,  // Argument of periapsis
  ASCENDING_NODE: 76.68069,  // Longitude of ascending node
};

const EARTH = {
  MASS: 5.97237e24,
  RADIUS: 6378.1366,
  SEMI_MAJOR: CONSTS.AU * 0.99999636386,
  ECCENTRICITY: 0.01671022,
  INCLINATION: 1.5717062,
  PERIAPSIS_ARG: 102.94719,  // Argument of periapsis
  ASCENDING_NODE: -11.26064, // Longitude of ascending node
};

const MARS = {
  MASS: 6.4171e23,
  RADIUS: 3396.19,
  SEMI_MAJOR: CONSTS.AU * 1.5236716,,
  ECCENTRICITY: 0.09341233,
  INCLINATION: 1.6311871,
  PERIAPSIS_ARG: 336.04084,  // Argument of periapsis
  ASCENDING_NODE: 49.57854,  // Longitude of ascending node
};

const JUPITER = {
  MASS: 1.8982e27,
  RADIUS: 71492,
  SEMI_MAJOR: CONSTS.AU * 5.20114,
  ECCENTRICITY: 0.04839266,
  INCLINATION: 0.3219657,
  PERIAPSIS_ARG: 14.75385,   // Argument of periapsis
  ASCENDING_NODE: 100.55615, // Longitude of ascending node
};

const SATURN = {
  MASS: 5.6834e26,
  RADIUS: 60268,
  SEMI_MAJOR: CONSTS.AU * 9.537924,
  ECCENTRICITY: 0.05415060,
  INCLINATION: 0.9254848,
  PERIAPSIS_ARG: 92.43194,   // Argument of periapsis
  ASCENDING_NODE: 113.71504, // Longitude of ascending node
};

const URANUS = {
  MASS: 8.6810e25,
  RADIUS: 25559,
  SEMI_MAJOR: CONSTS.AU * 19.18304,
  ECCENTRICITY: 0.04716771,
  INCLINATION: 0.9946743,
  PERIAPSIS_ARG: 170.96424,  // Argument of periapsis
  ASCENDING_NODE: 74.22988,  // Longitude of ascending node
};

const NEPTUNE = {
  MASS: 1.02413e26,
  RADIUS: 24764,
  SEMI_MAJOR: CONSTS.AU * 30.0547,
  ECCENTRICITY: 0.00858587,
  INCLINATION: 0.7354109,
  PERIAPSIS_ARG: 44.97135,   // Argument of periapsis
  ASCENDING_NODE: 131.72169, // Longitude of ascending node
};

const STARS = {
  G0: gen_star(1.15, 1.10, 5980),
  //G1: gen_star(1.10, , 5900),
  G2: gen_star(1.07, 1.00, 5800),
  //G3: gen_star(1.04, , 5710),
  //G4: gen_star(1.00, , 5690),
  G5: gen_star(0.98, 0.92, 5620),
  //G6: gen_star(0.93, , 5570),
  //G7: gen_star(0.90, , 5500),
  //G8: gen_star(0.87, , 5450),
  //G9: gen_star(0.84, , 5370),
};


const planets = [MERCURY, VENUS, EARTH, MARS, JUPITER, SATURN, URANUS, NEPTUNE];

planets.forEach(p => {
  const e = p.ECCENTRICITY;
  p.PERIHELION = calc_perihelion(p.SEMI_MAJOR, e);
  p.APHELION = calc_aphelion(p.SEMI_MAJOR, e);
  p.PERIOD = calc_orbit_period(p.SEMI_MAJOR, SUN.MASS);
  p.MEAN_SPEED = calc_mean_speed(p.SEMI_MAJOR, p.PERIOD, e);
});

module.exports = {
  CONSTS,
  SUN,
  MERCURY,
  VENUS,
  EARTH,
  MARS,
  JUPITER,
  SATURN,
  URANUS,
  NEPTUNE,
  STARS,
};
