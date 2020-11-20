'use strict';

/**
 * Most data taken from JPL's astrodynamic and NIST PML constants:
 * https://ssd.jpl.nasa.gov/?constants
 * https://physics.nist.gov/cuu/Constants/Table/allascii.txt
 */

module.exports = {
  AU: 149597870.7,                  // km
  C: 299792458,                     // m⋅s⁻¹
  DAY: 86400,                       // Julian day
  G: 6.6743e-11,                    // N⋅m²⋅kg⁻² OR m³⋅kg⁻¹⋅s⁻²
  GM: 1.32712440018e20,             // m³⋅s⁻² or G⋅M☉
  SIDEREAL_DAY: 86164.09054,        // sidereal day
  SIDEREAL_YEAR: 365.256363004,     // sidereal day
  SOLAR_LUMINOSITY: 3.828e26,       // L☉
  SOLAR_MASS: 1.98847e30,           // M☉
  SOLAR_RADIUS: 695660,             // R☉
  STEFAN_BOLTZMANN: 5.670374419e-8, // W⋅m⁻²⋅K⁻⁴
  YEAR: 365.25,                     // Julian year
  YEAR_SEC: 365.25 * 86400,         // Julian year in seconds
  ZERO_POINT_LUMINOSITY: 3.0128e28, // Watts
}
