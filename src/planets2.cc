#include "utils.h"
#include "math_vector.h"

#include <atomic>
#include <algorithm>
#include <cmath>
#include <string>
#include <thread>
#include <vector>

#include <sstream>

using ssm::Vector;
using std::atomic;
using std::pow;
using std::sqrt;
using std::stod;
using std::string;
using std::stringstream;
using std::thread;
using std::vector;

class ProcessingThread;
class SystemBody;
class System;

//static void print_vector(Vector* v);
static double d2r(double d);
static void kep2cart(double M, double a, double e, double i, double w,
                     double Om, double E, Vector& pos, Vector& acc);
static void print_body(SystemBody* p);
static void print_system(System* s);


class SystemBody {
 public:
  SystemBody() { }
  // TODO Upon creation determine the ||r||^2 value using the body's mass at
  // which acceleration no longer needs to be calculated. Then use this when
  // calculating the acceleration to return early if the calculation is not
  // needed.
  SystemBody(string name,
             double mass,
             double radius,
             double a,   // semi_major,
             double e,   // eccentricity,
             double i,   // inclination,
             double w,   // argument of periapsis
             double Om,  // longitude of ascending node
             double E);  // eccentric anomaly

  // TODO(trevnorris): Add ability to center a body around another body.
  // acceleration calculations should be done here instead of in System to
  // make working with threads easier. Use system_ to retrieve the full list of
  // bodies that this instance needs to calculate acceleration against.

  string& name();
  double mass();
  double radius();
  Vector& pos();
  Vector& vel();
  Vector& acc();
  System* system();
  SystemBody* orbiting();
  void set_orbit(SystemBody* body);
  void update_acceleration(vector<SystemBody*>& bodies);
  void update_position_velocity(double t);

 private:
  friend class System;

  void add_orbiting_body(SystemBody* body);
  void remove_orbiting_body(SystemBody* body);

  string name_ = "[unknown]";
  double mass_ = 0;
  double radius_ = 0;
  double a_ = 0;
  double e_ = 0;
  double i_ = 0;
  double w_ = 0;
  double Om_ = 0;
  double E_ = 0;
  // Maximum ||r||^2 value where gravitational acceleration should be calc'd.
  //double r_concern_ = 0;
  System* system_;
  SystemBody* orbiting_ = nullptr;
  vector<SystemBody*> orbited_ = {};
  Vector pos_ = { 0, 0, 0 };
  Vector vel_ = { 0, 0, 0 };
  Vector acc_ = { 0, 0, 0 };
};


class System {
 public:
  void add_body(SystemBody* body);
  // TODO implement
  //void remove_body(SystemBody* body);

  // Thread-safe to read since there will be no additional writers.
  vector<SystemBody*>& bodies();

  // Run system using step seconds, for dur steps, using threads.
  void step(double step);

 private:
  vector<SystemBody*> bodies_ = {};
  vector<ProcessingThread*> threads_ = {};
};


// TODO Upon creation determine the ||r||^2 value using the body's mass at
// which acceleration no longer needs to be calculated. Then use this when
// calculating the acceleration to return early if the calculation is not
// needed.
SystemBody::SystemBody(string name,
           double mass,
           double radius,
           double a,  // semi_major,
           double e,  // eccentricity,
           double i,  // inclination,
           double w,  // argument of periapsis
           double Om, // longitude of ascending node
           double E)  // eccentric anomaly
    : name_(name),
      mass_(mass),
      radius_(radius),
      a_(a),
      e_(e),
      i_(i),
      w_(w),
      Om_(Om),
      E_(E) {
}

string& SystemBody::name() { return name_; }
double SystemBody::mass() { return mass_; }
double SystemBody::radius() { return radius_; }
Vector& SystemBody::pos() { return pos_; }
Vector& SystemBody::vel() { return vel_; }
Vector& SystemBody::acc() { return acc_; }

System* SystemBody::system() {
  return system_;
}

SystemBody* SystemBody::orbiting() {
  return orbiting_;
}

// TODO(trevnorris): Simply adding position vectors isn't good enough. Fix it.
void SystemBody::set_orbit(SystemBody* body) {
  if (body == this) {
    return;
  }
  // Body was orbiting something already, remove it from the other Body's list.
  if (orbiting_ != nullptr) {
    orbiting_->remove_orbiting_body(this);
  }
  orbiting_ = body;
  orbiting_->add_orbiting_body(this);
  kep2cart(orbiting_->mass(), a_, e_, i_, w_, Om_, E_, pos_, vel_);
  pos_ += orbiting_->pos();
  for (auto& b : orbited_) {
    // Some unnecessary operations will happen here, but this code is executed
    // very little. So not going to worry about it.
    b->set_orbit(this);
  }
}

void SystemBody::add_orbiting_body(SystemBody* body) {
  if (std::end(orbited_) == std::find(orbited_.begin(), orbited_.end(), body))
    return;
  orbited_.push_back(body);
}

void SystemBody::remove_orbiting_body(SystemBody* body) {
  auto i = std::find(orbited_.begin(), orbited_.end(), body);
  if (std::end(orbited_) != i) {
    orbited_.erase(i);
  }
}

void SystemBody::update_acceleration(vector<SystemBody*>& bodies) {
  acc_.zero();
  for (SystemBody* body : bodies) {
    Vector& p = body->pos();
    double rsq = pos_.mag_sq(&p);
    if (&pos_ == &p)
      continue;
    //if (rsq < r_concern_)
      //continue;
    acc_ += -G * body->mass() / (rsq * sqrt(rsq)) * (pos_ - p);
  }
}

void SystemBody::update_position_velocity(double t) {
  pos_ += vel_ * t + acc_ * t * t * 0.5;
  vel_ += acc_ * t;
}


void System::add_body(SystemBody* body) {
  bodies_.push_back(body);
  // TODO(trevnorris): if system_ != nullptr then remove from the other sysstem
  body->system_ = this;
}

vector<SystemBody*>& System::bodies() {
  return bodies_;
}


void System::step(double step) {
  for (auto& sb : bodies_) {
    sb->update_acceleration(bodies_);
  }
  for (auto& sb : bodies_) {
    sb->update_position_velocity(step);
  }
}


int main(int argc, char* argv[]) {
  System ssm;
  SystemBody sun("sun",         1.9885e30,  696342000, 0, 0, 0, 0, 0, 0);
  SystemBody mercury("mercury", 3.3011e23,  2439700,  57909175678.24835,  0.20563069, 6.3472876, 77.45645,  48.33167,  0);
  SystemBody venus("venus",     4.8675e24,  6051800,  108208925513.1937,  0.00677323, 2.1545480, 131.53298, 76.68069,  0);
  SystemBody earth("earth",     5.97237e24, 6378137,  149597887155.76578, 0.01671022, 1.5717062, 102.94719, -11.26064, 0);
  //SystemBody moon("moon", 7.34767309e22, 1737100, 384400000, 0.0549, 5.145, 0, 0, 0);
  SystemBody mars("mars",       6.4171e23,  3396200,  227936637241.84332, 0.09341233, 1.6311871, 336.04084, 49.57854,  0);
  SystemBody jupiter("jupiter", 1.8982e27,  71492000, 778412026775.1428,  0.04839266, 0.3219657, 14.75385,  100.55615, 0);
  SystemBody saturn("saturn",   5.6834e26,  60268000, 1426725412588.1675, 0.05415060, 0.9254848, 92.43194,  113.71504, 0);
  SystemBody uranus("uranus",   8.6810e25,  25559000, 2870972219969.714,  0.04716771, 0.9946743, 170.96424, 74.22988,  0);
  SystemBody neptune("neptune", 1.02413e26, 24764000, 4498252910764.0625, 0.00858587, 0.7354109, 44.97135,  131.72169, 0);
  SystemBody pluto("pluto",     1.309e22,   1188300,  5906376272436.361,  0.24880766, 17.14175,  224.06676, 110.30347, 0);

  mercury.set_orbit(&sun);
  venus.set_orbit(&sun);
  earth.set_orbit(&sun);
  //moon.set_orbit(&earth);
  mars.set_orbit(&sun);
  jupiter.set_orbit(&sun);
  saturn.set_orbit(&sun);
  uranus.set_orbit(&sun);
  neptune.set_orbit(&sun);
  pluto.set_orbit(&sun);

  ssm.add_body(&sun);
  ssm.add_body(&mercury);
  ssm.add_body(&venus);
  ssm.add_body(&earth);
  ssm.add_body(&mars);
  ssm.add_body(&jupiter);
  ssm.add_body(&saturn);
  ssm.add_body(&uranus);
  ssm.add_body(&neptune);
  ssm.add_body(&pluto);

  double YEAR_SEC = 365.2422 * 86400;
  double YEARS = 1;
  double TOTAL_TIME = YEARS * 365.2422 * 86400;
  double STEP_SEC = 1;
  size_t iter = 0;
  uint64_t t;

  print_system(&ssm);
  printf("\n");

  t = hrtime();

  for (double i = 0; i < TOTAL_TIME; i += STEP_SEC) {
    if ((size_t)i % (size_t)(YEAR_SEC / 10 * STEP_SEC) < 1) {
      double u = (hrtime() - t) / 1e9;
      double est = u / (i / TOTAL_TIME) - u * (i / TOTAL_TIME);
      printf("\r%c[2K", 27);
      printf("%.2f year(s) calculated   %.4f remaining",
             i / YEAR_SEC,
             est);
      fflush(stdout);
    }
    iter++;
    ssm.step(STEP_SEC);
  }

  t = hrtime() - t;
  printf("\r%c[2K", 27);
  print_system(&ssm);
  printf("step: %.2f    iter: %lu   %.2f ns/iter   %.2f minutes\n",
         STEP_SEC,
         iter,
         1.0 * t / iter,
         1.0 * t / 1e9 / 60);
  printf("%.2f years computed\n",
         1.0 * iter * STEP_SEC / 86400 / 365.256);

  return 0;
}


double d2r(double d) {
  return d * PI / 180;
}


/**
 * M - mass of orbited body
 * a - semi-major axis
 * e - eccentricity
 * i - inclination
 * w - argument of periapsis (ω)
 * Om - longitude of ascending node (ω or Ω)
 * E - eccentric anomaly < 2π, angle of point P if orbit of P was a circle.
 * v - true anomaly (ν, θ, or f)
 * r - radius; distance from the focus to point P
 * h - angular momentum
 */
void kep2cart(double M, double a, double e, double i, double w, double Om,
              double E, Vector& pos, Vector& vel) {
  i = d2r(i);
  w = d2r(w);
  Om = d2r(Om);
  double v = 2 * atan(sqrt((1 + e) / (1 - e)) * tan(E / 2));
  double r = a * (1 - e * cos(E));
  double mu = G * M;
  double h = sqrt(mu * a / (1 - e * e));
  pos.set(r * (cos(Om) * cos(w + v) - sin(Om) * sin(w + v) * cos(i)),
          r * (sin(Om) * cos(w + v) + cos(Om) * sin(w + v) * cos(i)),
          r * (sin(i) * sin(w + v)));
  vel.set(-(mu / h) * (cos(Om) * (sin(w + v) + e * sin(w)) +
                       sin(Om) * (cos(w + v) + e * cos(w)) * cos(i)),
          -(mu / h) * (sin(Om) * (sin(w + v) + e * sin(w)) -
                       cos(Om) * (cos(w + v) + e * cos(w)) * cos(i)),
          (mu / h) * (cos(w + v) + e * cos(w)) * sin(i));
}


void print_body(SystemBody* p) {
  SystemBody* o = p->orbiting();
  printf("[%s]\n", p->name().c_str());
  printf("  [position]  x: %-14.7f y: %-14.7f z: %-14.7f  to orbiting: %.7f\n",
         p->pos().x() / AU,
         p->pos().y() / AU,
         p->pos().z() / AU,
         //p->pos().len() / AU);
         o != nullptr ? p->pos().mag(o->pos()) / AU : 0);
  printf("  [velocity]  x: %-14.7f y: %-14.7f z: %-14.7f  velocity: %.2f m/s\n",
         p->vel().x(),
         p->vel().y(),
         p->vel().z(),
         p->vel().len());
}


void print_system(System* s) {
  for (auto& b : s->bodies()) {
    print_body(b);
  }
}

/*
static void printPlanet(SystemBody* p, SystemBody* sun) {
  if (p == nullptr) return;
  printf("[%s]\n", p->name.c_str());
  printf("  [position]  x: %-14.7fy: %-14.7fz: %.7f  mag: %.7f\n",
         p->pos()->x() / AU,
         p->pos()->y() / AU,
         p->pos()->z() / AU,
         p->pos()->mag(sun->pos()) / AU);
  printf("  [velocity]  x: %-14.7fy: %-14.7fz: %.7f  len: %.7f\n",
         p->vel()->x(),
         p->vel()->y(),
         p->vel()->z(),
         p->vel()->len());
  //printf("  aphelion: %.7f   perihelion: %.7f\n",
         //p->inicon.aphelion / AU,
         //p->inicon.perihelion / AU);
  //if (sun == nullptr) return;
  //printf("  to %s: %-12.4f wobble: %-12.4f vel: %.1f\n",
         //sun->name.c_str(),
         //p->pos()->mag(sun->pos()) / AU,
         //p->pos()->len() / AU - p->pos()->mag(sun->pos()) / AU,
         //p->vel()->len());
}
*/
