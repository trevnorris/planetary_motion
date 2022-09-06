use std::ops::{Add, Sub, Mul, Div, AddAssign, SubAssign, MulAssign, DivAssign};

#[allow(dead_code)]
#[derive(Copy, Clone)]
#[derive(Debug)]
pub struct Vec {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}


#[allow(dead_code)]
impl Vec {
    pub fn zero(&mut self) -> Self {
        self.x = 0.0;
        self.y = 0.0;
        self.z = 0.0;
        *self
    }
    pub fn mag_sq(&self, o: Vec) -> f64 {
        (self.x - o.x).powf(2.0) +
        (self.y - o.y).powf(2.0) +
        (self.z - o.z).powf(2.0)
    }
    pub fn set(&mut self, x: f64, y: f64, z: f64) {
        self.x = x;
        self.y = y;
        self.z = z;
    }
}


impl Add for Vec {
    type Output = Self;
    fn add(self, o: Self) -> Self {
        Self { x: self.x + o.x, y: self.y + o.y, z: self.z + o.z }
    }
}

impl Add<f64> for Vec {
    type Output = Self;
    fn add(self, f: f64) -> Self {
        Self { x: self.x + f, y: self.y + f, z: self.z + f }
    }
}

impl AddAssign for Vec {
    fn add_assign(&mut self, o: Self) {
        *self = Self { x: self.x + o.x, y: self.y + o.y, z: self.z + o.z };
    }
}

impl AddAssign<f64> for Vec {
    fn add_assign(&mut self, f: f64) {
        *self = Self { x: self.x + f, y: self.y + f, z: self.z + f };
    }
}

impl Sub for Vec {
    type Output = Self;
    fn sub(self, o: Self) -> Self {
        Self { x: self.x - o.x, y: self.y - o.y, z: self.z - o.z }
    }
}

impl Sub<f64> for Vec {
    type Output = Self;
    fn sub(self, f: f64) -> Self {
        Self { x: self.x - f, y: self.y - f, z: self.z - f }
    }
}

impl SubAssign for Vec {
    fn sub_assign(&mut self, o: Self) {
        *self = Self { x: self.x - o.x, y: self.y - o.y, z: self.z - o.z };
    }
}

impl SubAssign<f64> for Vec {
    fn sub_assign(&mut self, f: f64) {
        *self = Self { x: self.x - f, y: self.y - f, z: self.z - f };
    }
}

impl Mul for Vec {
    type Output = Self;
    fn mul(self, o: Self) -> Self {
        Self { x: self.x * o.x, y: self.y * o.y, z: self.z * o.z }
    }
}

impl Mul<f64> for Vec {
    type Output = Self;
    fn mul(self, f: f64) -> Self {
        Self { x: self.x * f, y: self.y * f, z: self.z * f }
    }
}

impl MulAssign for Vec {
    fn mul_assign(&mut self, o: Self) {
        *self = Self { x: self.x * o.x, y: self.y * o.y, z: self.z * o.z };
    }
}

impl MulAssign<f64> for Vec {
    fn mul_assign(&mut self, f: f64) {
        *self = Self { x: self.x * f, y: self.y * f, z: self.z * f };
    }
}

impl Div for Vec {
    type Output = Self;
    fn div(self, o: Self) -> Self {
        Self { x: self.x / o.x, y: self.y / o.y, z: self.z / o.z }
    }
}

impl Div<f64> for Vec {
    type Output = Self;
    fn div(self, f: f64) -> Self {
        Self { x: self.x / f, y: self.y / f, z: self.z / f }
    }
}

impl DivAssign for Vec {
    fn div_assign(&mut self, o: Self) {
        *self = Self { x: self.x / o.x, y: self.y / o.y, z: self.z / o.z };
    }
}

impl DivAssign<f64> for Vec {
    fn div_assign(&mut self, f: f64) {
        *self = Self { x: self.x / f, y: self.y / f, z: self.z / f };
    }
}
