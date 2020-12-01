'use strict';

const { PI, abs, asin, atan, cos, floor, log10, sin, sqrt, tan } = Math;
const {
  C,
  DAY,
  G,
  GM,
  SOLAR_LUMINOSITY,
  SOLAR_MASS,
  SOLAR_RADIUS,
  STEFAN_BOLTZMANN,
  YEAR_SEC,
  ZERO_POINT_LUMINOSITY,
} = require('./constants.js');


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
  return 2 * r2d(asin(r / a)) * 3600;
}

/**
 * Return the angular diameter of an object in millimeters at distance m.
 *
 * a - distance from object in km.
 * r - radius of object in km.
 * m - perceived distance in meters.
 */
function angular_diameter(a, r, m = 1) {
  return 2 * asin(r / a) * m * 1000;
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
 * Approximate the eccentric anomaly from the mean anomaly in degrees.
 * M - mean anomaly in degrees
 * e - eccentricity
 */
function calc_eccentric_anomaly(m, e) {
  m = d2r(m);
  let E = PI * 2;
  let diff = PI;

  for (let i = 0; i < 30; i++) {
    // Calculating the mean anomaly for comparison.
    const t = E - e * sin(E);
    if (abs(t - m) < 1e-9)
      break;
    E += t > m ? -diff : diff;
    diff /= 2;
  }

  return r2d(E);
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
  return calc_orbit_period(a / 1000, M) / DAY;
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
  return calc_lum(R / 1000, T) / SOLAR_LUMINOSITY;
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
    stellar_lum: luminosity / SOLAR_LUMINOSITY,
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
  const lum = calc_lum(R0 / 1000 * SOLAR_RADIUS, T);
  const abs_mag = -2.5 * log10(lum / ZERO_POINT_LUMINOSITY);
  return {
    mass: M0 * SOLAR_MASS,
    radius: R0 * SOLAR_RADIUS,
    temp: T,
    luminosity: lum,
    stellar_lum: lum / SOLAR_LUMINOSITY,
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
 * Convert Keplarian coordinates to cartesian coordinates in km.
 *
 * M - mass of orbited body in kg
 * a - semi-major axis in km
 * e - eccentricity
 * i - inclination in degrees
 * w - argument of periapsis (ω) in degrees
 * Om - longitude of ascending node (ω or Ω) in degrees
 * m - mean anomaly
 * E - eccentric anomaly < 2π, angle of point P if orbit of P was a circle.
 * v - true anomaly (ν, θ, or f)
 * r - radius; distance from the focus to point P
 * h - angular momentum
 */
function kep_to_cart(M, a, e, i, w, Om, m) {
  a *= 1000;  // from km to m
  i = d2r(i);
  w = d2r(w);
  Om = d2r(Om);

  // TODO(trevnorris): There should be other equations that allow going from
  // mean anomaly directly to true anomaly and radius.
  const E = calc_eccentric_anomaly(m, e);
  const v = 2 * atan(sqrt((1 + e) / (1 - e)) * tan(E / 2));
  const r = a * (1 - e * cos(E));
  const mu = G * M;
  const h = sqrt(mu * a / (1 - e**2));

  const cos_Om = cos(Om);
  const cos_i = cos(i);
  const cos_w = cos(w);
  const cos_wv = cos(w + v);
  const sin_Om = sin(Om);
  const sin_i = sin(i);
  const sin_w = sin(w);
  const sin_wv = sin(w + v);

  const x = r * (cos_Om * cos_wv - sin_Om * sin_wv * cos_i) / 1e3;
  const y = r * (sin_Om * cos_wv + cos_Om * sin_wv * cos_i) / 1e3;
  const z = r * (sin_i * sin_wv) / 1e3;

  const v_x = -(mu / h) * (cos_Om * (sin_wv + e * sin_w) +
                           sin_Om * (cos_wv + e * cos_w) * cos_i) / 1e3;
  const v_y = -(mu / h) * (sin_Om * (sin_wv + e * sin_w) -
                           cos_Om * (cos_wv + e * cos_w) * cos_i) / 1e3;
  const v_z = (mu / h) * (cos_wv + e * cos_w) * sin_i / 1e3;

  return [{ x, y, z }, { x: v_x, y: v_y, z: v_z }];
}

// M - absolute magnitude
// D - distance from star in km
function relative_mag(M, D) {
  return M - 5 + 5 * log10(D * 1000);
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
  R *= 1000;
  // TODO There should be a correction facter of (1 - A) / 𝜀
  return T**2 * R * sqrt(1 - A) / (2 * P**2) / 1000;
}


module.exports = {
  angular_diameter,
  arcsec_diameter,
  black_body_temp,
  calc_aphelion,
  calc_eccentric_anomaly,
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
  star_to_period,
  temp_to_semimajor,
};
