#ifndef PLANET_H_
#define PLANET_H_

#include "math_vector.h"

#include <string>
#include <vector>

#define G 6.67408e-11
#define AU 149597870700
#define PI 3.141592653589793

namespace ssm {

class SystemBody {
 public:
  SystemBody() = delete;
  SystemBody(std::string name, double mass, double radius)
    : name_(name),
      mass_(mass),
      radius_(radius),
      orbiting_(nullptr) {
  }

  // Set one SystemBody in the orbit of another. The initial position and
  // velocity will be set based on the location of the orbited body.
  // TODO(trevnorris): Allow customization of the angle of perihelion and the
  // lowest point in the inclination?
  inline void add_satellite(SystemBody* sb,
                            double semi_major,
                            double eccentricity,
                            double inclination) {
    if (sb == this) { return; }

    sb->semi_major_ = semi_major;
    sb->eccentricity_ = eccentricity;
    sb->inclination_ = inclination;
    sb->aphelion_ = semi_major * (1 + eccentricity);
    sb->perihelion_ = semi_major * (1 - eccentricity);

    if (sb->orbiting_ != nullptr) {
      sb->remove_satellite(sb);
    }
    sb->orbiting_ = this;
    satellites_.push_back(sb);
    for (auto& p : satellites_) {
      p->update_orbit();
    }
  }

  inline void remove_satellite(SystemBody* sb) {
    for (auto it = satellites_.begin(); it != satellites_.end(); it++) {
      if (*it == sb) satellites_.erase(it);
    }
  }

  // Step in time t seconds forward and calculate the gravity for all sbs.
  inline void add_acceleration(std::vector<SystemBody*> sbs, double t) {
    for (auto& sb : sbs) {
      sb->acc_->zero();
    }
    for (auto& sb : sbs) {
      if (sb == this) continue;
    }
  }

  inline std::string name() const { return name_; }
  inline double mass() const { return mass_; }
  inline double radius() const { return radius_; }
  inline Vector position() const { return pos_; }
  inline Vector velocity() const { return vel_; }
  inline Vector acceleration() const { return acc_; }
  inline SystemBody* orbiting() const { return orbiting_; }

 private:
  inline void update_orbit() {
    if (orbiting() != nullptr) {
      pos_.set(orbiting_->aphelion_ + aphelion_, 0, 0);
      double bv = std::sqrt(
          G * orbiting_->mass() * (2 / aphelion_ - 1 / semi_major_));
      vel_.set(bv * std::acos(inclination_ * PI / 180),
               -bv * std::sin(inclination_ * PI / 180),
               0);
    }

    for (auto& p : satellites_) {
      p->update_orbit();
    }
  }
  inline void add_velocity(double t) {
    pos_ += vel_ * t + acc_ * t * t;
    vel_ += acc_ * t;
  }

  std::string name_;
  double mass_;
  double radius_;
  double semi_major_ = 0;
  double eccentricity_ = 0;
  double inclination_ = 0;
  double aphelion_ = 0;
  double perihelion_ = 0;
  Vector pos_;
  Vector vel_;
  Vector acc_;
  SystemBody* orbiting_;
  std::vector<SystemBody*> satellites_;
};

}  // namespace ssm

#endif  // PLANET_H_
