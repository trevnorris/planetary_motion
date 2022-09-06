#[path = "./vec.rs"] mod vec;
#[path = "./consts.rs"] mod consts;

pub use consts::{ G };
pub use vec::Vec;


#[allow(non_snake_case)]
#[derive(Debug)]
pub struct Planet {
    pub name: String,
    pub mass: f64,
    pub radius: f64,
    pub a: f64,   // semi_major,
    pub e: f64,   // eccentricity,
    pub i: f64,   // inclination,
    pub w: f64,   // argument of periapsis
    pub Om: f64,  // longitude of ascending node
    pub E: f64,   // eccentric anomaly
    pub acc: Vec,
    pub vel: Vec,
    pub pos: Vec,
}


#[allow(non_snake_case)]
pub fn gen_planet(name_: &str,
                  mass: f64,
                  radius: f64,
                  a: f64,
                  e: f64,
                  i: f64,
                  w: f64,
                  Om: f64,
                  E: f64) -> Planet {
    Planet {
        name: String::from(name_),
        mass,
        radius,
        a,
        e,
        i,
        w,
        Om,
        E,
        acc: Vec { x: 0.0, y: 0.0, z: 0.0 },
        vel: Vec { x: 0.0, y: 0.0, z: 0.0 },
        pos: Vec { x: 0.0, y: 0.0, z: 0.0 },
    }
}


// M - mass of orbited body
// a - semi-major axis
// e - eccentricity
// i - inclination
// w - argument of periapsis (ω)
// Om - longitude of ascending node (ω or Ω)
// E - eccentric anomaly < 2π, angle of point P if orbit of P was a circle.
// v - true anomaly (ν, θ, or f)
// r - radius; distance from the focus to point P
// h - angular momentum
#[allow(non_snake_case)]
pub fn kep2cart(M: f64, p: &mut Planet) {
  let i = d2r(p.i);
  let w = d2r(p.w);
  let Om = d2r(p.Om);
  let v: f64 = 2.0 * ((1.0 * p.e) / (1.0 - p.e)).sqrt().atan() *
      (p.E / 2.0).tan();
  let r: f64 = p.a * (1.0 - p.e * p.E.cos());
  let mu: f64 = G * M;
  let h: f64 = (mu * p.a / (1.0 - p.e * p.e)).sqrt();
  p.pos.set(r * (Om.cos() * (w + v).cos() - Om.sin() * (w + v).sin() * i.cos()),
            r * (Om.sin() * (w + v).cos() + Om.cos() * (w + v).sin() * i.cos()),
            r * (i.sin() * (w + v).sin()));
  p.vel.set(
    -(mu / h) * (Om.cos() * ((w + v).sin() + p.e * w.sin()) +
        Om.sin() * ((w + v).cos() + p.e * w.cos()) * i.cos()),
    -(mu / h) * (Om.sin() * ((w + v).sin() + p.e * w.sin()) -
        Om.cos() * ((w + v).cos() + p.e * w.cos()) * i.cos()),
    (mu / h) * ((w + v).cos() + p.e * w.cos()) * i.sin());
}

fn d2r(d: f64) -> f64 {
  return d * std::f64::consts::PI / 180.0;
}
