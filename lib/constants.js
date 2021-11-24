'use strict';

const { log10, sqrt, PI } = Math;
/**
 * All unites of measurement are either kilograms, meters, meters/sec
 *
 * Values taken from
 * http://asa.hmnao.com/static/files/2018/Astronomical_Constants_2018.txt
 */

const CONSTS = {
  C: 299792458,               // m⋅s⁻¹
  G: 6.67428e-11,             // N⋅m²⋅kg⁻² OR m³⋅kg⁻¹⋅s⁻²
  GM: 1.32712440041e20,       // m³⋅s⁻²
  AU: 149597870700,           // meters
  DAY_SEC: 86400,             // one day in seconds
  // TODO(trevnorris): Should this use Julian?
  YEAR_DAY: 365.2421875,       // days in one tropical year
  YEAR_SEC: 365.2421875 * 86400, // seconds in a year
  STEFAN_BOLTZMANN: 5.670374419e-8,   // W⋅m⁻²⋅K⁻⁴
  ZERO_POINT_LUMINOSITY: 3.0128e28,   // Watts
}

const SUN = {
  MASS: 1.98847e30,
  RADIUS: 696342000,
  TEMP: 5778,
  LUMINOSITY: calc_lum(696342000, 5778),
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
  RADIUS: 6378136.6,
  SEMI_MAJOR: 149597887155.76578,
  ECCENTRICITY: 0.01671022,
  INCLINATION: 1.5717062,
  PERIAPSIS_ARG: 102.94719,  // Argument of periapsis
  ASCENDING_NODE: -11.26064, // Longitude of ascending node
};

const MARS = {
  MASS: 6.4171e23,
  RADIUS: 3396190,
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

const SL = SUN.LUMINOSITY;

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

function calc_lum(radius, temp) {
  return CONSTS.STEFAN_BOLTZMANN * 4 * PI* radius**2 * temp**4;
}

// mass and radius are in solar units.
function gen_star(mass, radius, temp) {
  const lum = calc_lum(radius * SUN.RADIUS, temp);
  const abs_mag = -2.5 * log10(lum / CONSTS.ZERO_POINT_LUMINOSITY);
  return {
    MASS: mass * SUN.MASS,
    RADIUS: radius * SUN.RADIUS,
    TEMP: temp,
    LUMINOSITY: lum,
    STELLAR_LUMINOSITY: lum / SUN.LUMINOSITY,
    // TODO(trevnorris): wrong.
    ABS_MAG: abs_mag,
  };
}

const planets = [MERCURY, VENUS, EARTH, MARS, JUPITER, SATURN, URANUS, NEPTUNE];
const C = CONSTS;
planets.forEach(p => {
  const e = p.ECCENTRICITY;
  p.PERIHELION = p.SEMI_MAJOR * (1 - e);
  p.APHELION = p.SEMI_MAJOR * (1 + e);
  p.PERIOD = sqrt(4 * PI**2 * p.SEMI_MAJOR**3 / (C.G * SUN.MASS)) / C.DAY_SEC;
  p.MEAN_SPEED = (2 * PI * p.SEMI_MAJOR / (p.PERIOD * 86400)) *
                 (1 - 1 / 4 * e**2 - 3 / 64 * e**4 - 5 / 256 * e**6);
});

module.exports = {
  CONSTS, SUN, MERCURY, VENUS, EARTH, MARS, JUPITER, SATURN, URANUS, NEPTUNE,
  STARS,
};
