const Vector = require('../lib/vector');
const { orbit_period, orbit_period_days, star_to_period, gen_star, rotate_main, rotate_second, grshift, grshift_as, darcsec, adiam, sec_to_string, relative_mag } = require('../lib/misc_fns');
const VALS = require('../lib/constants');
const { G, AU, C } = VALS.CONSTS;
const { SUN, MERCURY, VENUS, EARTH, MARS, JUPITER, SATURN, URANUS, NEPTUNE, STARS } = VALS;
const { black_body_temp, temp2distance } = require('../lib/effective_temp');
const { kep2cart } = require('../lib/kep2cart');
