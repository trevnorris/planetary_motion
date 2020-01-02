#include "utils.h"
#include "system_bodies.h"
#include <cstdio>
#include <vector>

using ssm::SystemBody;
using ssm::Vector;

void print_body(const SystemBody& s, const SystemBody& t) {
  auto p = s.pos();
  auto v = s.vel();
  auto a = s.acc();
  std::printf("%s\n", s.name().c_str());
  std::printf("  [pos] x: %g   y: %g, z: %g   mag: %g\n",
              (p.x() - t.pos().x()) / AU,
              (p.y() - t.pos().y()) / AU,
              (p.z() - t.pos().z()) / AU,
              p.mag(t.pos()) / AU);
  std::printf("  [vel] x: %g   y: %g, z: %g   mag: %g\n", v.x(), v.y(), v.z(), v.mag(t.vel()));
  std::printf("  [acc] x: %g   y: %g, z: %g   mag: %g\n", a.x(), a.y(), a.z(), a.mag(t.acc()));
  std::printf("  [aphelion] %g   [perihelion] %g\n", s.aphelion() / AU, s.perihelion() / AU);
}
void print_body(const SystemBody& s) {
  auto p = s.pos();
  auto v = s.vel();
  auto a = s.acc();
  std::printf("%s\n", s.name().c_str());
  std::printf("  [pos] x: %g   y: %g, z: %g\n", p.x(), p.y(), p.z());
  std::printf("  [vel] x: %g   y: %g, z: %g   mag: %g\n", v.x(), v.y(), v.z(), v.len());
  std::printf("  [acc] x: %g   y: %g, z: %g\n", a.x(), a.y(), a.z());
}


int main() {
  std::vector<SystemBody*> sbv;
  SystemBody sun("sun", 1.9885e30, 696342000);
  SystemBody earth("earth", 5.97237e24, 6378137);
  SystemBody jupiter("jupiter", 1.8982e27, 71492000);

  sun.add_satellite(&earth, 149597887155.76578, 0.01671022, 1.5717062);
  sun.add_satellite(&jupiter, 778412026775.1428, 0.04839266, 0.3219657);

  sbv.push_back(&sun);
  sbv.push_back(&earth);
  sbv.push_back(&jupiter);

  print_body(sun);
  print_body(earth, sun);
  print_body(jupiter, sun);

  size_t ITER = 31556927;
  uint64_t t = hrtime();

  for (size_t i = 0; i < ITER; i++) {
    sun.calc_acceleration(sbv, 1);
    earth.calc_acceleration(sbv, 1);
    jupiter.calc_acceleration(sbv, 1);
    sun.update_pos(1);
    earth.update_pos(1);
    jupiter.update_pos(1);
  }

  t = hrtime() - t;

  print_body(sun);
  print_body(earth, sun);
  print_body(jupiter, sun);

  printf("%lu ns/iter\n", t / ITER);

  return 0;
}
