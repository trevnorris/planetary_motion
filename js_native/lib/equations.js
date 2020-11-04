'use strict';

const { PI, atan, cos, floor, log10, sin, sqrt, tan } = Math;
const {
  AU, C, DAY_SEC, G, GM, STEFAN_BOLTZMANN, YEAR_SEC, ZERO_POINT_LUMINOSITY
} = require('./constants.js');

// To prevent a circular dependency, pulling these from solar_system_planets.js.
const SUN_MASS = GM / G;
const SUN_RADIUS = 696342;
const SUN_LUMINOSITY = calc_lum(SUN_RADIUS, 5778);

module.exports = {
  angular_diameter,
  arcsec_diameter,
  black_body_temp,
  calc_aphelion,
  calc_lum,
  calc_mean_speed,
  calc_orbit_period,
  calc_orbit_period_days,
  calc_perihelion,
  calc_solar_lum,
  gen_star,
  gen_star_solar,
  grshift,
  grshift_year,
  kep_to_cart,
  relative_mag,
  rotate_main,
  rotate_second,
  star_to_period,
  temp_to_semimajor,
};


function d2r(n) {
  return n * PI / 180;
}

function r2d(n) {
  return n * 180 / PI;
}

/**
 * Return the diameter of a planet in arc seconds.
 *
 * a - distance from object in km.
 * r - radius of object in km.
 */
function arcsec_diameter(a, r) {
  return 2 * r2d(atan(r / a)) * 3600;
}

/**
 * Return the angular diameter of an object in millimeters at distance m.
 *
 * a - distance from object in km.
 * r - radius of object in km.
 * m - perceived distance in meters.
 */
function angular_diameter(a, r, m = 1) {
  return 2 * atan(r / a) * m * 1000;
}

/**
 * Returns black body temperate of planet in Celsius.
 *
 * T - surface temperate of the star in Kelvin
 * R - radius of the star in km
 * D - distance of the star to the planet in km
 * a - albedo
 */
function black_body_temp(T, R, D, a) {
  return T * sqrt((sqrt(1 - a) * R) / (2 * D)) - 273.15;
}

/**
 * Calculate the aphelion of an orbit.
 *
 * a - semi-major axis in km
 * e - eccentricity
 */
function calc_aphelion(a, e) {
  return a * 1000 / (1 + e);
}

/**
 * Calculate the luminosity of star.
 *
 * R - radius of the star in km
 * T - surface temp of the star in Kelvin
 */
function calc_lum(R, T) {
  return STEFAN_BOLTZMANN * 4 * PI * ((R * 1000)**2) * T**4;
}

/**
 * Calculate the mean speed of a planet's orbit.
 *
 * a - semi-major axis in km
 * p - period in earth days
 */
function calc_mean_speed(a, p, e) {
  return (2 * PI * (a * 1000) / (p * 86400)) *
    // 0.25 = 1 /4
    // 0.046875 = 3 / 64
    // 0.01953125 = 5 / 256
    (1 - 0.25 * e**2 - 0.046875 * e**4 - 0.01953125 * e**6);
}

/**
 * Return the orbital period of a planet in seconds.
 *
 * a - semi-major axis in km
 * M - mass of the star in kg
 */
function calc_orbit_period(a, M) {
  return 2 * PI * sqrt((a * 1000)**3 / G / M);
}

/**
 * Return the orbital period of a planet in earth days.
 *
 * a - semi-major axis in km
 * M - mass of the star in kg
 */
function calc_orbit_period_days(a, M) {
  return calc_orbit_period(a / 1000, M) / DAY_SEC;
}

/**
 * Calculate the perihelion of an orbit.
 *
 * a - semi-major axis in km
 * e - eccentricity
 */
function calc_perihelion(a, e) {
  return a * 1000 / (1 - e);
}

/**
 * Calculate the solar luminosity of star (luminosity relative to sun).
 *
 * R - radius of the star in km
 * T - surface temp of the star in Kelvin
 */
function calc_solar_lum(R, T) {
  return calc_lum(R / 1000, T) / SUN_LUMINOSITY;
}

/**
 * Generate a star's information with basic parameters.
 *
 * M - mass of star in kg
 * R - radius of the star in km
 * T - surface temp of the star in Kelvin
 */
function gen_star(M, R, T) {
  const luminosity = calc_lum(R / 1000, T);
  const abs_mag = -2.5 * log10(luminosity, ZERO_POINT_LUMINOSITY);
  return {
    mass: M,
    radius: R,
    temp: T,
    luminosity,
    stellar_lum: luminosity / SUN_LUMINOSITY,
    // TODO(trevnorris): wrong.
    abs_mag,
  };
}

/**
 * Generate a star's information with basic parameters in solar units.
 *
 * M0 - mass of star in M☉ (solar mass)
 * R0 - radius of star in R☉ (solar radius)
 * T - surface temp of the star in Kelvin
 */
function gen_star_solar(M0, R0, T) {
  const lum = calc_lum(R0 / 1000 * SUN_RADIUS, T);
  const abs_mag = -2.5 * log10(lum / ZERO_POINT_LUMINOSITY);
  return {
    mass: M0 * SUN_MASS,
    radius: R0 * SUN_RADIUS,
    temp: T,
    luminosity: lum,
    stellar_lum: lum / SUN_LUMINOSITY,
    // TODO(trevnorris): wrong.
    abs_mag,
  };
}

/**
 * Calculate the perihelion shift explained by general relativity in arcsec.
 *
 * a - semi-major axis in km.
 * M - the mass of the star.
 * e - is the eccentricity.
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
 * after converting 6π to degrees then arcseconds is:
 *
 *         3888000GM
 *    σ = -----------
 *         (1-e²)ac²
 *
 */
function grshift(a, M, e) {
  return 3.888e6 * G * M / ((1 - e**2) * a * 1000 * C**2);
}

/**
 * Calculate the perihelion shift from general relativity in arc seconds per
 * year.
 *
 * a - semi-major axis in km.
 * M - the mass of the star.
 * e - is the eccentricity.
 */
function grshift_year(a, M, e) {
  return grshift(a, M, e) * YEAR_SEC / calc_orbit_period(a, M);
}

/**
 * Convert Keplarian coordinates to cartesian coordinates.
 * TODO(trevnorris): This is returning in meters.
 *
 * M - mass of orbited body in kg
 * a - semi-major axis in km
 * e - eccentricity
 * i - inclination
 * w - argument of periapsis (ω)
 * Om - longitude of ascending node (ω or Ω)
 * E - eccentric anomaly < 2π, angle of point P if orbit of P was a circle.
 * v - true anomaly (ν, θ, or f)
 * r - radius; distance from the focus to point P
 * h - angular momentum
 */
function kep_to_cart(M, a, e, i, w, Om, E) {
  a *= 1000;  // from km to m
  i = d2r(i);
  w = d2r(w);
  Om = d2r(Om);
  const v = 2 * atan(sqrt((1 + e) / (1 - e)) * tan(E / 2));
  const r = a * (1 - e * cos(E));
  const mu = G * M;
  const h = sqrt(mu * a / (1 - e**2));

  const x = r * (cos(Om) * cos(w + v) - sin(Om) * sin(w + v) * cos(i));
  const y = r * (sin(Om) * cos(w + v) + cos(Om) * sin(w + v) * cos(i));
  const z = r * (sin(i) * sin(w + v));

  const v_x = -(mu / h) * (cos(Om) * (sin(w + v) + e * sin(w)) +
                           sin(Om) * (cos(w + v) + e * cos(w)) * cos(i));
  const v_y = -(mu / h) * (sin(Om) * (sin(w + v) + e * sin(w)) -
                           cos(Om) * (cos(w + v) + e * cos(w)) * cos(i));
  const v_z = (mu / h) * (cos(w + v) + e * cos(w)) * sin(i);
  return [{ x, y, z }, { x: v_x, y: v_y, z: v_z }];
}

// M - absolute magnitude
// D - distance from star in km
function relative_mag(M, D) {
  return M - 5 + 5 * log10(D * 1000);
}

/**
 * Rotate main coord by t degrees.
 *
 * a - perihelion in km
 * b - TODO(trevnorris) no idea, but usually is 0.
 * t - periapsis in km
 */
function rotate_main(a, b, t) {
  a *= 1000;
  t *= 1000;
  return a * cos(t * PI / 180) - b * sin(t * PI / 180);
}

/**
 * Rotate secondary coord by t degrees
 *
 * a - perihelion in km
 * b - TODO(trevnorris) no idea, but usually is 0.
 * t - periapsis in km
 */
function rotate_second(a, b, t) {
  a *= 1000;
  t *= 1000;
  return a * sin(t * PI / 180) + b * cos(t * PI / 180);
}

/**
 * Given the following parameters, calculate the period of orbit around a star.
 * This is useful when the final state of the planet is known, and need to work
 * back.
 *
 * P - black body temp of planet in Celsius
 * T - surface temp of the star in Kelvin
 * R - radius of the star in km
 * A - albedo
 * M - mass of star in kg
 */
function star_to_period(P, T, R, A, M) {
  return calc_orbit_period(temp_to_semimajor(P, T, R / 1000, A), M);
}

/**
 * Return semi-major axis from star for a planet to have a specific temperature
 * in km.
 *
 * P - black body temp of planet in Celsius
 * T - surface temp of the star in Kelvin
 * R - radius of the star in km
 * A - albedo
 */
function temp_to_semimajor(P, T, R, A) {
  P += 273.15;
  return (sqrt(1 - A) * R * 1000 * T**2 / (2 * P**2)) / 1000;
}
