'use strict';

/**
 * All unites of measurement are either kilograms, meters, meters/sec
 *
 * Values taken from https://nssdc.gsfc.nasa.gov/planetary/factsheet/
 */

const CONSTS = {
  C: 299792458,               // speed of light m/s
  // Retrieved from https://physics.nist.gov/cuu/Constants/Table/allascii.txt
  G: 6.67408e-11,             // N m²/kg² OR m³/(kg s²)
  AU: 149597870700,           // meters
  DAY_SEC: 86400,             // one day in seconds
  YEAR_DAY: 365.2422,         // days in one year
  YEAR_SEC: 365.2422 * 86400, // seconds in a year
}

const SUN = {
  MASS: 1.9885e30,
  RADIUS: 696342000,
  SURFACE_TEMP: 5778,
};

// SEMI_MAJOR and ECCENTRICITY were taken from J2000 values on
// https://nssdc.gsfc.nasa.gov/planetary/factsheet/
// The value of AU above was used to convert the distances.
// INCLINATION is on the invariable plane.

const MERCURY = {
  MASS: 3.3011e23,
  RADIUS: 2439700,
  SEMI_MAJOR: 57909175678.24835,
  ECCENTRICITY: 0.20563069,
  INCLINATION: 6.3472876,
  PERIAPSIS_ARG: 77.45645,  // Argument of periapsis
  ASCENDING_NODE: 48.33167, // Longitude of ascending node
};

const VENUS = {
  MASS: 4.8675e24,
  RADIUS: 6051800,
  SEMI_MAJOR: 108208925513.1937,
  ECCENTRICITY: 0.00677323,
  INCLINATION: 2.1545480,
  PERIAPSIS_ARG: 131.53298,  // Argument of periapsis
  ASCENDING_NODE: 76.68069, // Longitude of ascending node
};

const EARTH = {
  MASS: 5.97237e24,
  RADIUS: 6378137,
  SEMI_MAJOR: 149597887155.76578,
  ECCENTRICITY: 0.01671022,
  INCLINATION: 1.5717062,
  PERIAPSIS_ARG: 102.94719,  // Argument of periapsis
  ASCENDING_NODE: -11.26064, // Longitude of ascending node
};

const MARS = {
  MASS: 6.4171e23,
  RADIUS: 3396200,
  SEMI_MAJOR: 227936637241.84332,
  ECCENTRICITY: 0.09341233,
  INCLINATION: 1.6311871,
  PERIAPSIS_ARG: 336.04084,  // Argument of periapsis
  ASCENDING_NODE: 49.57854, // Longitude of ascending node
};

const JUPITER = {
  MASS: 1.8982e27,
  RADIUS: 71492000,
  SEMI_MAJOR: 778412026775.1428,
  ECCENTRICITY: 0.04839266,
  INCLINATION: 0.3219657,
  PERIAPSIS_ARG: 14.75385,  // Argument of periapsis
  ASCENDING_NODE: 100.55615, // Longitude of ascending node
};

const SATURN = {
  MASS: 5.6834e26,
  RADIUS: 60268000,
  SEMI_MAJOR: 1426725412588.1675,
  ECCENTRICITY: 0.05415060,
  INCLINATION: 0.9254848,
  PERIAPSIS_ARG: 92.43194,  // Argument of periapsis
  ASCENDING_NODE: 113.71504, // Longitude of ascending node
};

const URANUS = {
  MASS: 8.6810e25,
  RADIUS: 25559000,
  SEMI_MAJOR: 2870972219969.714,
  ECCENTRICITY: 0.04716771,
  INCLINATION: 0.9946743,
  PERIAPSIS_ARG: 170.96424,  // Argument of periapsis
  ASCENDING_NODE: 74.22988, // Longitude of ascending node
};

const NEPTUNE = {
  MASS: 1.02413e26,
  RADIUS: 24764000,
  SEMI_MAJOR: 4498252910764.0625,
  ECCENTRICITY: 0.00858587,
  INCLINATION: 0.7354109,
  PERIAPSIS_ARG: 44.97135,  // Argument of periapsis
  ASCENDING_NODE: 131.72169, // Longitude of ascending node
};

const SM = SUN.MASS;
const SR = SUN.RADIUS;

const STARS = {
  G0: { MASS: 1.15 * SM, TEMP: 5980, RADIUS: 1.10 * SR },
  G1: { MASS: 1.10 * SM, TEMP: 5900 },
  G2: { MASS: 1.07 * SM, TEMP: 5800, RADIUS: 1.00 * SR },
  G3: { MASS: 1.04 * SM, TEMP: 5710 },
  G4: { MASS: 1.00 * SM, TEMP: 5690 },
  G5: { MASS: 0.98 * SM, TEMP: 5620, RADIUS: 0.92 * SR },
  G6: { MASS: 0.93 * SM, TEMP: 5570 },
  G7: { MASS: 0.90 * SM, TEMP: 5500 },
  G8: { MASS: 0.87 * SM, TEMP: 5450 },
  G9: { MASS: 0.84 * SM, TEMP: 5370 },
}

module.exports = {
  CONSTS, SUN, MERCURY, VENUS, EARTH, MARS, JUPITER, SATURN, URANUS, NEPTUNE,
  STARS,
};

const planets = [MERCURY, VENUS, EARTH, MARS, JUPITER, SATURN, URANUS, NEPTUNE];

planets.forEach(p => {
  const e = p.ECCENTRICITY;
  p.PERIHELION = p.SEMI_MAJOR * (1 - e);
  p.APHELION = p.SEMI_MAJOR * (1 + e);
  p.PERIOD = Math.sqrt(4 * Math.PI**2 * p.SEMI_MAJOR**3 /
                       (CONSTS.G * SUN.MASS)) / 86400;
  p.MEAN_SPEED = (2 * Math.PI * p.SEMI_MAJOR / (p.PERIOD * 86400)) *
                 (1 - 1 / 4 * e**2 - 3 / 64 * e**4 - 5 / 256 * e**6);
});
