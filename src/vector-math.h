#ifndef __SRC_VECTOR_MATH_H__
#define __SRC_VECTOR_MATH_H__

#include <cmath>

class Vector {
 public:
  Vector() : _x(0), _y(0), _z(0) { }
  Vector(double x, double y, double z) : _x(x), _y(y), _z(z) { }
  Vector(const Vector& v) : _x(v.x()), _y(v.y()), _z(v.z()) { }

  inline void set(double x, double y, double z) {
    _x = x; _y = y; _z = z;
  }

  inline void reset() {
    set(0, 0, 0);
  }

  inline void add(Vector& v) {
    _x += v.x();
    _y += v.y();
    _z += v.z();
  }
  inline void add(double s) {
    _x += s;
    _y += s;
    _z += s;
  }
  inline void add(double x, double y, double z) {
    _x += x;
    _y += y;
    _z += z;
  }

  inline void sub(Vector& v) {
    _x -= v.x();
    _y -= v.y();
    _z -= v.z();
  }
  inline void sub(double s) {
    _x -= s;
    _y -= s;
    _z -= s;
  }
  inline void sub(double x, double y, double z) {
    _x -= x;
    _y -= y;
    _z -= z;
  }

  inline void mul(Vector& v) {
    _x *= v.x();
    _y *= v.y();
    _z *= v.z();
  }
  inline void mul(double s) {
    _x *= s;
    _y *= s;
    _z *= s;
  }
  inline void mul(double x, double y, double z) {
    _x *= x;
    _y *= y;
    _z *= z;
  }

  inline void div(Vector& v) {
    _x /= v.x();
    _y /= v.y();
    _z /= v.z();
  }
  inline void div(double s) {
    _x /= s;
    _y /= s;
    _z /= s;
  }
  inline void div(double x, double y, double z) {
    _x /= x;
    _y /= y;
    _z /= z;
  }

  inline double len_sq() {
    return _x * _x + _y * _y + _z * _z;
  }

  inline double len() {
    return std::sqrt(len_sq());
  }

  inline double mag_sq(Vector* v) {
    return std::pow(_x - v->x(), 2) + std::pow(_y - v->y(), 2) +
           std::pow(_z - v->z(), 2);
  }

  inline double mag(Vector* v) {
    return std::sqrt(mag_sq(v));
  }

  double x() const { return _x; }
  double y() const { return _y; }
  double z() const { return _z; }
 private:
  double _x;
  double _y;
  double _z;
};

#endif  // __SRC_VECTOR_MATH_H__
