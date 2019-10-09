#include "vector-math.h"

#include <signal.h>

#include <chrono>
#include <cmath>
#include <string>
#include <vector>
#include <sstream>

using std::pow;
using std::sqrt;
using std::stod;
using std::string;
using std::stringstream;
using std::vector;

#define G 6.67408e-11
#define AU 149597870700
#define PI 3.141592653589793


static uint64_t hrtime() {
  return std::chrono::duration_cast<std::chrono::nanoseconds>(
      std::chrono::steady_clock::now().time_since_epoch()).count();
}


struct IniCon {
  double inclination;
  double semi_major;
  double eccentricity;
  double aphelion;
  double perihelion;
};


struct Planet {
  Planet(string n, double m, double r = 0)
    : name(n), mass(m), radius(r), inicon(), _pos(), _vel(), _acc() { }
  Planet(string n,      // name
         double m,      // mass
         double in,     // inclination
         double sm,     // semi-major
         double ec,     // eccentricity
         double r = 0)  // radius
    : name(n), mass(m), radius(r), _pos(), _vel(), _acc() {
    inicon.inclination = in;
    inicon.semi_major = sm;
    inicon.eccentricity = ec;
    inicon.aphelion = sm * (1 + ec);
    inicon.perihelion = sm * (1 - ec);
    pos()->set(inicon.aphelion, 0, 0);
  }

  inline Vector* pos() { return &_pos; }
  inline Vector* vel() { return &_vel; }
  inline Vector* acc() { return &_acc; }

  string name;
  double mass;
  double radius;
  IniCon inicon;
  Vector _pos;
  Vector _vel;
  Vector _acc;
};


static inline void add_acceleration(Planet* p1, Planet* p2) {
  auto p1pos = p1->pos();
  auto p2pos = p2->pos();
  double dx = p1pos->x() - p2pos->x();
  double dy = p1pos->y() - p2pos->y();
  double dz = p1pos->z() - p2pos->z();
  double rsq = dx * dx + dy * dy + dz * dz;
  double r = 1 / sqrt(rsq);
  double Fg;

  Fg = -G * p2->mass / rsq;
  p1->acc()->add(Fg * dx * r,
                 Fg * dy * r,
                 Fg * dz * r);

  Fg = -G * p1->mass / rsq;
  p2->acc()->add(Fg * (p2pos->x() - p1pos->x()) * r,
                 Fg * (p2pos->y() - p1pos->y()) * r,
                 Fg * (p2pos->z() - p1pos->z()) * r);
}

static inline void add_position_velocity(Planet* p1, double t) {
  double tsq = t * t * 0.5;
  auto p1pos = p1->pos();
  auto p1vel = p1->vel();
  auto p1acc = p1->acc();
  p1pos->add(p1vel->x() * t + p1acc->x() * tsq,
             p1vel->y() * t + p1acc->y() * tsq,
             p1vel->z() * t + p1acc->z() * tsq);
  p1vel->add(p1acc->x() * t,
             p1acc->y() * t,
             p1acc->z() * t);
}


struct SolarSystem {
  SolarSystem() { }
  SolarSystem(vector<Planet*> p) : planets(p), sun(nullptr) { }

  void init() {
    Vector bc_p;
    double M = sun->mass;
    double bc_m = M;

    // Calculate initial velocity of each planet.
    for (auto b : planets) {
      auto bi = &b->inicon;
      auto vel = b->vel();
      // Calculate the instantaneous orbital speed at the aphelion. Taken from
      // https://en.wikipedia.org/wiki/Orbital_speed#Instantaneous_orbital_speed
      double bv = sqrt(G * M * (2 / bi->aphelion - 1 / bi->semi_major));
      vel->set(0,
               bv * cos(bi->inclination * PI / 180),
               -bv * sin(bi->inclination * PI / 180));
    }

    // Calculate barycenter, assume position of sun is [0, 0, 0]. Start by
    // summing m1 * x1 + m2 * x2 + ... and also summing m1 + m2
    for (auto b : planets) {
      Vector tpos = *b->pos();
      bc_m += b->mass;
      tpos.mul(b->mass);
      bc_p.add(tpos);
    }
    bc_p.div(bc_m);

    // Adjust the position of the planets and sun to place the barycenter at
    // coordinates [0, 0, 0].
    sun->pos()->sub(bc_p);
    for (auto b : planets) {
      b->pos()->sub(bc_p);
    }
  }

  void add_sun(Planet* p) {
    sun = p;
  }

  void add_planet(Planet* p) {
    planets.push_back(p);
  }

  // TODO: Implement collision detection. To do this will need the radius of
  // each planet, then need to used the distance between them.
  void step(uint64_t t) {
    // First need to reset all acceleration Vectors.
    for (auto& b1 : planets) {
      b1->acc()->reset();
    }
    sun->acc()->reset();
    for (size_t i = 0; i < planets.size(); i++) {
      for (size_t j = i + 1; j < planets.size(); j++) {
        add_acceleration(planets[i], planets[j]);
      }
      add_acceleration(sun, planets[i]);
    }
    for (auto& b1 : planets) {
      add_position_velocity(b1, t);
    }
    add_position_velocity(sun, t);
  }

  Planet* get_planet(string name) {
    for (auto planet : planets) {
      if (planet->name == name) {
        return planet;
      }
    }
    return nullptr;
  }

  vector<Planet*> planets;
  Planet* sun;
};


// TODO: Fix this horrible ugliness...
uint64_t t;
double STEP_SEC;
size_t iter;
SolarSystem* ssm = nullptr;
Planet* sun = nullptr;


static void printPlanet(Planet* p, Planet* sun) {
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


static void printSystem(SolarSystem* ssm, Planet* sun) {
  printPlanet(sun, sun);
  for (auto p : ssm->planets) {
    if (sun != nullptr && p->name == sun->name) continue;
    printPlanet(p, sun);
  }
}

/*
void s_handler(int s) {
  printf("%c[2K\r", 27);
  t = hrtime() - t;
  printSystem(ssm, sun);
  printf("step: %.2f    iter: %lu   %.2f ns/iter   %.2f minutes\n",
         STEP_SEC,
         iter,
         1.0 * t / iter,
         1.0 * t / 1e9 / 60);
  printf("%.2f years computed\n",
         1.0 * iter * STEP_SEC / 60 / 60 / 24 / 365.256);
  exit(0);
}
*/


int main(int argc, char* argv[]) {
  /*
  struct sigaction sigIntHandler;

  sigIntHandler.sa_handler = s_handler;
  sigemptyset(&sigIntHandler.sa_mask);
  sigIntHandler.sa_flags = 0;
  sigaction(SIGINT, &sigIntHandler, nullptr);
  */

  Planet sun("sun",         1.9885e30,  696342000);
  Planet mercury("mercury", 3.3011e23,  6.3472876, 57909175678.24835,  0.20563069, 2439700);
  Planet venus("venus",     4.8675e24,  2.1545480, 108208925513.1937,  0.00677323, 6051800);
  Planet earth("earth",     5.97237e24, 1.5717062, 149597887155.76578, 0.01671022, 6378137);
  Planet mars("mars",       6.4171e23,  1.6311871, 227936637241.84332, 0.09341233, 3396200);
  Planet jupiter("jupiter", 1.8982e27,  0.3219657, 778412026775.1428,  0.04839266, 71492000);
  Planet saturn("saturn",   5.6834e26,  0.9254848, 1426725412588.1675, 0.05415060, 60268000);
  Planet uranus("uranus",   8.6810e25,  0.9946743, 2870972219969.714,  0.04716771, 25559000);
  Planet neptune("neptune", 1.02413e26, 0.7354109, 4498252910764.0625, 0.00858587, 24764000);

  SolarSystem ssm;
  ssm.add_sun(&sun);
  ssm.add_planet(&mercury);
  ssm.add_planet(&venus);
  ssm.add_planet(&earth);
  ssm.add_planet(&mars);
  ssm.add_planet(&jupiter);
  ssm.add_planet(&saturn);
  ssm.add_planet(&uranus);
  ssm.add_planet(&neptune);
  ssm.init();

  double YEAR_SEC = 365.2422 * 86400;
  double YEARS = 10;
  double TOTAL_TIME = YEARS * 365.2422 * 86400;
  STEP_SEC = 1;
  iter = 0;

  printSystem(&ssm, &sun);
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
  printSystem(&ssm, &sun);
  printf("step: %.2f    iter: %lu   %.2f ns/iter   %.2f minutes\n",
         STEP_SEC,
         iter,
         1.0 * t / iter,
         1.0 * t / 1e9 / 60);
  printf("%.2f years computed\n",
         1.0 * iter * STEP_SEC / 86400 / 365.256);

  return 0;
}

/*
  if (i % (YEAR_SEC / 10 * STEP) < 1) {
    const u = (hrtime() - t) / 1e9;
    const est = u / (i / TOTAL_TIME) - u * (i / TOTAL_TIME);
    process.stdout.cursorTo(0);
    process.stdout.clearLine();
    process.stdout.write(`${(i / YEAR_SEC).toFixed(1)} year(s) calculated`);
    if (Number.isFinite(est)) {
      process.stdout.write(`   ${sec_to_string(est)} remaining`);
    }
  }
*/
