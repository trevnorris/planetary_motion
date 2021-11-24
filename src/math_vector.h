#ifndef MATH_VECTOR_H_
#define MATH_VECTOR_H_

#include <cmath>

namespace ssm {

class Vector {
 public:
  Vector() : coords_{0, 0, 0} { }
  Vector(const Vector& v) : coords_{v.x(), v.y(), v.z()} { }
  Vector(double x, double y, double z) : coords_{x, y, z} { }

  constexpr inline double x() const { return coords_[0]; }
  constexpr inline double y() const { return coords_[1]; }
  constexpr inline double z() const { return coords_[2]; }
  inline void x(double n) { coords_[0] = n; }
  inline void y(double n) { coords_[1] = n; }
  inline void z(double n) { coords_[2] = n; }

  inline void set(double x_, double y_, double z_) {
    coords_[0] = x_;
    coords_[1] = y_;
    coords_[2] = z_;
  }
  inline void set(const Vector& v) { set(v.x(), v.y(), v.z()); }
  inline void set(Vector* v) { set(v->x(), v->y(), v->z()); }
  inline void zero() { set(0, 0, 0); }

  constexpr inline double len_sq() const {
    return x() * x() + y() * y() + z() * z();
  }
  inline double len() const { return std::sqrt(len_sq()); }

  inline double mag_sq(const Vector& v) const {
    return std::pow(x() - v.x(), 2) + std::pow(y() - v.y(), 2) +
      std::pow(z() - v.z(), 2);
  }
  inline double mag_sq(Vector* v) const { return mag_sq(*v); }

  inline double mag(const Vector& v) const {
    return std::sqrt(mag_sq(v));
  }
  inline double mag(Vector* v) const { return mag(*v); }

  constexpr inline double dot(const Vector& v) const {
    return x() * v.x() + y() * v.y() + z() * v.z();
  }
  constexpr inline double dot(Vector* v) const { return dot(*v); }

  inline double angle_rad(const Vector& v) const {
    return std::acos(dot(v) / (len() * v.len()));
  }
  inline double angle_rad(Vector* v) const { return angle_rad(*v); }

  inline double angle_deg(const Vector& v) const {
    return angle_rad(v) * 180 / 3.141592653589793;
  }
  inline double angle_deg(Vector* v) const { return angle_deg(*v); }

  inline Vector add(double n) const {
    return Vector(x() + n, y() + n, z() + n);
  }
  inline Vector add(const Vector& v) const {
    return Vector(x() + v.x(), y() + v.y(), z() + v.z());
  }
  inline Vector add(Vector* v) const { return add(*v); }

  inline Vector sub(double n) const {
    return Vector(x() - n, y() - n, z() - n);
  }
  inline Vector sub(const Vector& v) const {
    return Vector(x() - v.x(), y() - v.y(), z() - v.z());
  }
  inline Vector sub(Vector* v) const { return sub(*v); }

  inline Vector mul(double n) const {
    return Vector(x() * n, y() * n, z() * n);
  }
  inline Vector mul(const Vector& v) const {
    return Vector(x() * v.x(), y() * v.y(), z() * v.z());
  }
  inline Vector mul(Vector* v) const { return mul(*v); }

  inline Vector div(double n) const {
    return Vector(x() / n, y() / n, z() / n);
  }
  inline Vector div(const Vector& v) const {
    return Vector(x() / v.x(), y() / v.y(), z() / v.z());
  }
  inline Vector div(Vector* v) const { return div(*v); }

  friend Vector operator+(const Vector& u, double n) { return u.add(n); }
  friend Vector operator+(double n, const Vector& u) { return u.add(n); }
  friend Vector operator+(const Vector& u, const Vector& v) { return u.add(v); }
  friend Vector operator-(const Vector& u, double n) { return u.sub(n); }
  friend Vector operator-(double n, const Vector& u) { return u.sub(n); }
  friend Vector operator-(const Vector& u, const Vector& v) { return u.sub(v); }
  friend Vector operator*(const Vector& u, double n) { return u.mul(n); }
  friend Vector operator*(double n, const Vector& u) { return u.mul(n); }
  friend Vector operator*(const Vector& u, const Vector& v) { return u.mul(v); }
  friend Vector operator/(const Vector& u, double n) { return u.div(n); }
  friend Vector operator/(double n, const Vector& u) { return u.div(n); }
  friend Vector operator/(const Vector& u, const Vector& v) { return u.div(v); }

  Vector& operator=(const Vector& u) {
    set(u);
    return *this;
  }
  Vector& operator+=(const Vector& u) {
    set(x() + u.x(), y() + u.y(), z() + u.z());
    return *this;
  }
  Vector& operator-=(const Vector& u) {
    set(x() - u.x(), y() - u.y(), z() - u.z());
    return *this;
  }
  Vector& operator*=(const Vector& u) {
    set(x() * u.x(), y() * u.y(), z() * u.z());
    return *this;
  }
  Vector& operator/=(const Vector& u) {
    set(x() / u.x(), y() / u.y(), z() / u.z());
    return *this;
  }

 //private:
  double coords_[3];
};

}  // namespace ssm

#endif  // MATH_VECTOR_H_
