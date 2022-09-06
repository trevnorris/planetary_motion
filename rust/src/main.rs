mod planetary;

use planetary::{ gen_planet, kep2cart };
//use std::fs::{ read_to_string };

fn main() {
    // Would be better if this allowed cli options that point to a config file
    // that contains all the planetary data.
    //let planet_data = read_to_string("./planet_data.toml").expect("bad");
    //let foo = planet_data.parse::<toml::Value>().unwrap();

    let sun = gen_planet("sun",               1.9885e30,  696342000.0, 0.0,                0.0,        0.0,       0.0,       0.0,       0.0);
    let mut mercury = gen_planet("mercury",   3.3011e23,  2439700.0,   57909175678.24835,  0.20563069, 6.3472876, 77.45645,  48.33167,  0.0);
    let mut venus = gen_planet("venus",       4.8675e24,  6051800.0,   108208925513.1937,  0.00677323, 2.1545480, 131.53298, 76.68069,  0.0);
    let mut earth = gen_planet("earth",       5.97237e24, 6378137.0,   149597887155.76578, 0.01671022, 1.5717062, 102.94719, -11.26064, 0.0);
    let mut mars = gen_planet("mars",         6.4171e23,  3396200.0,   227936637241.84332, 0.09341233, 1.6311871, 336.04084, 49.57854,  0.0);
    let mut jupiter = gen_planet("jupiter",   1.8982e27,  71492000.0,  778412026775.1428,  0.04839266, 0.3219657, 14.75385,  100.55615, 0.0);
    let mut saturn = gen_planet("saturn",     5.6834e26,  60268000.0,  1426725412588.1675, 0.05415060, 0.9254848, 92.43194,  113.71504, 0.0);
    let mut uranus = gen_planet("uranus",     8.6810e25,  25559000.0,  2870972219969.714,  0.04716771, 0.9946743, 170.96424, 74.22988,  0.0);
    let mut neptune = gen_planet("neptune",   1.02413e26, 24764000.0,  4498252910764.0625, 0.00858587, 0.7354109, 44.97135,  131.72169, 0.0);
    let mut pluto = gen_planet("pluto",       1.309e22,   1188300.0,   5906376272436.361,  0.24880766, 17.14175,  224.06676, 110.30347, 0.0);
    let mut makemake = gen_planet("makemake", 3.1e21,     739000.0,    6815828586962.7,    0.15804,    28.98030,  295.0896,  79.6459,   0.0);
    let mut eris = gen_planet("eris",         1.66e22,    1163000.0,   10133759761218.0,   0.43883,    44.1444,   151.687,   35.9045,   0.0);
    let mut quaoar = gen_planet("quaoar",     1.4e21,     560500.0,    6536230166624.4,    0.03956,    7.9881,    146.462,   188.837,   0.0);
    let mut varuna = gen_planet("varuna",     1.55e20,    339000.0,    6399946506416.7,    0.05413,    17.220,    262.875,   97.369,    0.0);

    kep2cart(sun.mass, &mut mercury);
    kep2cart(sun.mass, &mut venus);
    kep2cart(sun.mass, &mut earth);
    kep2cart(sun.mass, &mut mars);
    kep2cart(sun.mass, &mut jupiter);
    kep2cart(sun.mass, &mut saturn);
    kep2cart(sun.mass, &mut uranus);
    kep2cart(sun.mass, &mut neptune);
    kep2cart(sun.mass, &mut pluto);
    kep2cart(sun.mass, &mut makemake);
    kep2cart(sun.mass, &mut eris);
    kep2cart(sun.mass, &mut quaoar);
    kep2cart(sun.mass, &mut varuna);

    println!("planet {:#?}", mercury);
    println!("planet {:#?}", venus);
    println!("planet {:#?}", earth);
}

