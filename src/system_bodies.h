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
  // velocity will be set based on the location of the orbited body. The
  // aphelion_angle (in degrees) is calculated at x = aphelion, y = 0 in a
  // clockwise motion.
  inline void add_satellite(SystemBody* sb,
                            double semi_major,
                            double eccentricity,
                            double inclination,
                            // The angle around the orbit where the aphelion
                            // location lies.
                            double periapsis_arg,
                            double inclination angle) {
    if (sb == this) { return; }
    if (sb->orbiting_ != nullptr) { sb->remove_satellite(sb); }

    sb->semi_major_ = semi_major;
    sb->eccentricity_ = eccentricity;
    sb->inclination_ = inclination;
    sb->aphelion_ = semi_major * (1 + eccentricity);
    sb->perihelion_ = semi_major * (1 - eccentricity);
    sb->orbiting_ = this;
    sb->periapsis_arg_ = periapsis_arg;
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
  inline void calc_acceleration(std::vector<SystemBody*> sbs, double t) {
    acc_.zero();
    for (auto& sb : sbs) {
      if (sb == this) continue;
      double rsq = pos_.mag_sq(sb->pos_);
      double r = std::sqrt(rsq);
      double Fg = -G * sb->mass() / rsq;
      acc_ += Fg * (pos_ - sb->pos_) / r;
    }
  }

  inline void update_pos(double t) {
    pos_ += t* vel_+ t * t * 0.5 * acc_;
    vel_ += acc_ * t;
  }

  inline std::string name() const { return name_; }
  inline double mass() const { return mass_; }
  inline double radius() const { return radius_; }
  inline double aphelion() const { return aphelion_; }
  inline double perihelion() const { return perihelion_; }
  inline Vector pos() const { return pos_; }
  inline Vector vel() const { return vel_; }
  inline Vector acc() const { return acc_; }
  inline SystemBody* orbiting() const { return orbiting_; }

 private:
  // Rotate main point by t degrees.
  static inline double rotate_main(a, b, t) {
    return a * std::cos(t * PI / 180) - b * std::sin(t * PI / 180);
  }
  // Rotate secondary point by t degrees
  static inline double rotate_second(a, b, t) {
    return a * std::sin(t * PI / 180) + b * std::cos(t * PI / 180);
  }

  // TODO(trevnorris): This doesn't update the initial velocities for all
  // bodies in the system. Only the orbiting body.
  // TODO(trevnorris): Add the angle at which the low/high/etc. point of the
  // inclination reaches a certain point.
  inline void update_orbit() {
    if (orbiting() != nullptr) {
      // Rotate position vector to the point in orbit around the aphelion.
      //double px = rotate_main(aphelion_, 0, aphelion_angle_);
      //double py = rotate_second(aphelion_, 0, aphelion_angle_);
      //pos.set(px, py, 0);

      // First rotate vector to position the aphelion.
      //double x = rotate_main(aphelion_, 0, aphelion_angle_);
      //double y = rotate_second(aphelion_, 0, aphelion_angle_);
      //double z = 0;
      // Then rotate 
      /*
      double x = aphelion_ * std::cos(aphelion_angle_ * PI / 180);
      double y = aphelion_ * std::sin(aphelion_angle_ * PI / 180);
      // TODO(trevnorris): Where'd I leave off?
      double
      //pos_.set(orbiting()->aphelion_ + aphelion_, 0, 0);
      //pos_.set(
      double bv = std::sqrt(
          G * orbiting()->mass() * (2 / aphelion_ - 1 / semi_major_));
      vel_.set(0,
               bv * std::cos(inclination_ * PI / 180),
               -bv * std::sin(inclination_ * PI / 180));
               */
    }

    for (auto& p : satellites_) {
      p->update_orbit();
    }
  }

  std::string name_;
  double mass_;
  double radius_;
  double semi_major_ = 0;
  double eccentricity_ = 0;
  double inclination_ = 0;
  double aphelion_ = 0;
  double perihelion_ = 0;
  double periapsis_arg_ = 0;
  Vector pos_;
  Vector vel_;
  Vector acc_;
  SystemBody* orbiting_;
  std::vector<SystemBody*> satellites_;
};

}  // namespace ssm

#endif  // PLANET_H_
