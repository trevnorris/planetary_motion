'use strict';

const { log10, sqrt, PI } = Math;
const { AU, GM, G, SOLAR_MASS, SOLAR_RADIUS } = require('./constants.js');
const {
  calc_lum,
  calc_aphelion,
  calc_perihelion,
  calc_orbit_period,
  calc_mean_speed,
  gen_star,
} = require('./equations.js');


const sun = {
  mass: SOLAR_MASS,
  radius: SOLAR_RADIUS,
  temp: 5778,
  luminosity: calc_lum(696342, 5778),
};

// The value of AU above was used to convert the distances.
// inclination is on the invariable plane.
// semi_major has been corrected to match the orbital period.

const mercury = {
  mass: 3.3011e23,
  radius: 2439.7,
  semi_major: AU * 0.3870973,
  eccentricity: 0.20563069,
  inclination: 6.3472876,
  mean_anomaly: 174.796,
  periapsis_arg: 77.45645,  // Argument of periapsis
  ascending_node: 48.33167, // Longitude of ascending node
};

const venus = {
  mass: 4.8675e24,
  radius: 6051.8,
  semi_major: AU * 0.723331,
  eccentricity: 0.00677323,
  inclination: 2.1545480,
  mean_anomaly: 50.115,
  periapsis_arg: 131.53298,  // Argument of periapsis
  ascending_node: 76.68069,  // Longitude of ascending node
};

const earth = {
  mass: 5.97237e24,
  radius: 6378.1366,
  semi_major: AU * 0.99999636386,
  eccentricity: 0.01671022,
  inclination: 1.5717062,
  mean_anomaly: 358.617,
  periapsis_arg: 102.94719,  // Argument of periapsis
  ascending_node: -11.26064, // Longitude of ascending node
};

const mars = {
  mass: 6.4171e23,
  radius: 3396.19,
  semi_major: AU * 1.5236716,
  eccentricity: 0.09341233,
  inclination: 1.6311871,
  mean_anomaly: 19.412,
  periapsis_arg: 336.04084,  // Argument of periapsis
  ascending_node: 49.57854,  // Longitude of ascending node
};

const jupiter = {
  mass: 1.8982e27,
  radius: 71492,
  semi_major: AU * 5.20114,
  eccentricity: 0.04839266,
  inclination: 0.3219657,
  mean_anomaly: 20.020,
  periapsis_arg: 14.75385,   // Argument of periapsis
  ascending_node: 100.55615, // Longitude of ascending node
};

const saturn = {
  mass: 5.6834e26,
  radius: 60268,
  semi_major: AU * 9.537924,
  eccentricity: 0.05415060,
  inclination: 0.9254848,
  mean_anomaly: 317.020,
  periapsis_arg: 92.43194,   // Argument of periapsis
  ascending_node: 113.71504, // Longitude of ascending node
};

const uranus = {
  mass: 8.6810e25,
  radius: 25559,
  semi_major: AU * 19.18304,
  eccentricity: 0.04716771,
  inclination: 0.9946743,
  mean_anomaly: 142.2386,
  periapsis_arg: 170.96424,  // Argument of periapsis
  ascending_node: 74.22988,  // Longitude of ascending node
};

const neptune = {
  mass: 1.02413e26,
  radius: 24764,
  semi_major: AU * 30.0547,
  eccentricity: 0.00858587,
  inclination: 0.7354109,
  mean_anomaly: 256.228,
  periapsis_arg: 44.97135,   // Argument of periapsis
  ascending_node: 131.72169, // Longitude of ascending node
};

/**
 * example generating a star.
 * TODO(trevnorris): Move this to another location.
const stars = {
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
*/


const planets = [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune];
planets.forEach(p => {
  const e = p.eccentricity;
  p.perihelion = calc_perihelion(p.semi_major, e) / 1e3;
  p.aphelion = calc_aphelion(p.semi_major, e) / 1e3;
  p.period = calc_orbit_period(p.semi_major, sun.mass);
  p.mean_speed = calc_mean_speed(p.semi_major, p.period, e);
});

module.exports = {
  sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune,
};
