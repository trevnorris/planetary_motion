#include <chrono>
#include <cmath>
#include <string>
#include <vector>

using std::pow;
using std::sqrt;
using std::string;
using std::vector;

#define G 6.67408e-11
#define AU 149597870000

struct SolarSystem;
struct Planet;
void printSystem(SolarSystem* ssm, Planet*);
void printPlanet(Planet* p, Planet* sun);
void add_acceleration(Planet* p1, Planet* p2);
void add_position_velocity(Planet* p1, double t);

uint64_t hrtime() {
  return std::chrono::duration_cast<std::chrono::nanoseconds>(
      std::chrono::steady_clock::now().time_since_epoch()).count();
}

struct Coord {
  double x;
  double y;
  double z;
};


struct Planet {
  Planet(string n, double m)
    : name(n), mass(m), pos(), vel(), acc() { }
  Planet(string n, double m, Coord p, Coord v, Coord a)
    : name(n), mass(m), pos(p), vel(v), acc(a) { }
  string name;
  double mass;
  Coord pos;
  Coord vel;
  Coord acc;
};


struct SolarSystem {
  SolarSystem() { }
  SolarSystem(vector<Planet*> p) : planets(p) { }
  std::vector<Planet*> planets;
  void step(uint64_t t) {
    for (auto b1 = planets.begin(); b1 != planets.end(); ++b1) {
      (*b1)->acc = { 0, 0, 0 };
      for (auto b2 = planets.begin(); b2 != planets.end(); ++b2) {
        if (*b1 == *b2) {
          continue;
        }
        add_acceleration(*b1, *b2);
      }
      add_position_velocity(*b1, t);
    }
  }
};


int main() {
  Planet sun("sun", 1.9885e30);

  Planet venus("venus",
               4.8675e24,
               Coord({ 1.08208e11, 0, 0 }),
               Coord({ 0, 35020, 0 }),
               Coord({ 0, 0, 0 }));

  Planet earth("earth",
               5.97237e24,
               Coord({ 1.495975e11, 0, 0 }),
               Coord({ 0, 29780, 0 }),
               Coord({ 0, 0, 0 }));

  Planet mars("mars",
              6.4171e23,
              Coord({ 2.2795e11, 0, 0 }),
              Coord({ 0, 24007, 0 }),
              Coord({ 0, 0, 0 }));

  Planet jupiter("jupiter",
                 1.8982e27,
                 Coord({ 7.785746345215e11, 0, 0 }),
                 Coord({ 0, 13070, 0 }),
                 Coord({ 0, 0, 0 }));

  Planet saturn("saturn",
                5.6834e26,
                Coord({ 1.433521589275e12, 0, 0 }),
                Coord({ 0, 9680, 0 }),
                Coord({ 0, 0, 0 }));

  Planet uranus("uranus",
                8.6810e25,
                Coord({ 2.8752710614e12, 0, 0 }),
                Coord({ 0, 6800, 0 }),
                Coord({ 0, 0, 0 }));

  SolarSystem ssm({ &sun, &venus, &earth, &mars, &jupiter, &saturn, &uranus });
  size_t STEP_SEC = 1;
  uint64_t DUR = 1e9 * 10;   // 1e9 is 1 sec
  size_t iter = 0;

  printSystem(&ssm, &sun);
  printf("\n");

  uint64_t t = hrtime();

  do {
    for (size_t i = 0; i < 100000; i++) {
      iter++;
      ssm.step(STEP_SEC);
    }
  } while (hrtime() - t < DUR);

  t = hrtime() - t;
  printSystem(&ssm, &sun);
  printf("step: %lu    iter: %lu   %.2f ns/iter   %.2f minutes\n",
         STEP_SEC,
         iter,
         1.0 * t / iter,
         1.0 * t / 1e9 / 60);
  printf("%.2f years computed\n",
         1.0 * iter * STEP_SEC / 60 / 60 / 24 / 365.256);

  return 0;
}


double len(Coord& c1) {
  return sqrt(c1.x * c1.x + c1.y * c1.y + c1.z * c1.z);
}


double mag(Coord* c1, Coord* c2) {
  return sqrt(pow(c1->x - c2->x, 2) + pow(c1->y - c2->y, 2) +
      pow(c1->z - c2->z, 2));
}


void add_acceleration(Planet* p1, Planet* p2) {
  double m = mag(&p1->pos, &p2->pos);
  double msq = m * m;
  p1->acc.x += (-G * p2->mass / msq) * ((p1->pos.x - p2->pos.x) / m);
  p1->acc.y += (-G * p2->mass / msq) * ((p1->pos.y - p2->pos.y) / m);
  p1->acc.z += (-G * p2->mass / msq) * ((p1->pos.z - p2->pos.z) / m);
}


void add_position_velocity(Planet* p1, double t) {
  double tsq = t * t;
  p1->pos.x += p1->vel.x * t + p1->acc.x * tsq / 2;
  p1->pos.y += p1->vel.y * t + p1->acc.y * tsq / 2;
  p1->pos.z += p1->vel.z * t + p1->acc.z * tsq / 2;
  p1->vel.x += p1->acc.x * t;
  p1->vel.y += p1->acc.y * t;
  p1->vel.z += p1->acc.z * t;
}


void printSystem(SolarSystem* ssm, Planet* sun) {
  for (auto p = ssm->planets.begin(); p != ssm->planets.end(); p++) {
    printPlanet(*p, sun);
  }
}


void printPlanet(Planet* p, Planet* sun) {
  printf("[%s]\n", p->name.c_str());
  //printf("  [position]  x: %-14.3fy: %-14.3fz: %.3f\n",
         //p->pos.x / AU,
         //p->pos.y / AU,
         //p->pos.z / AU);
  //printf("  [velocity]  x: %-14gy: %-14gz: %g\n",
         //p->vel.x,
         //p->vel.y,
         //p->vel.z);
  printf("  to sun: %-12.4e wobble: %-12.4e vel: %.1f\n",
         mag(&p->pos, &sun->pos) / AU,
         (len(p->pos) / AU) - (mag(&p->pos, &sun->pos) / AU),
         len(p->vel));
}
