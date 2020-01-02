#include "utils.h"
#include "math_vector.h"
#include <cstdio>

using ssm::Vector;

void print_vector(const Vector& v) {
  std::printf("x: %g   y: %g   z: %g\n", v.x(), v.y(), v.z());
}
void print_vector(Vector* v) {
  print_vector(*v);
}

int main() {
  Vector* p1 = new Vector(42, 100, 57);
  Vector* p2 = new Vector(42, 100, 50);
  Vector* v1 = new Vector(1, 2, 3);
  Vector* v2 = new Vector(4, 5, 6);
  Vector* a1 = new Vector(0, 0, 0);
  Vector* a2 = new Vector(0, 0, 0);
  size_t ITER = 1e6;
  double t = 1;
  uint64_t hrt = hrtime();
  double M = 1;

  //printf("p1.dot(p2): %g\n", p1->dot(p2));
  //printf("angle_rad: %g   angle_deg: %g\n", p1->angle_rad(p2), p1->angle_deg(p2));

  for (size_t i = 0; i < ITER; i++) {
    double rsq = p1->mag_sq(p2);
    double r = std::sqrt(rsq);
    double Fg = -G * rsq * 1e2;

    a1->zero();
    a2->zero();

    //*a1 = (*p1 - *p2) * r * Fg;
    //*a2 = (*p2 - *p1) * r * Fg;
    *a1 = -G * M * (*p1 - *p2) / (rsq * r);
    *a2 = -G * M * (*p2 - *p1) / (rsq * r);

    *p1 = *v1 * t + *a1 * t * t / 2;
    *p2 = *v2 * t + *a2 * t * t / 2;
    *v1 = *a1 * t;
    *v2 = *a2 * t;

    if (i < 10) {
      print_vector(p1);
    }
  }

  hrt = hrtime() - hrt;

  print_vector(p1);
  print_vector(p2);
  print_vector(v1);
  print_vector(v2);
  print_vector(a1);
  print_vector(a2);
  printf("%lu ns/iter\n", hrt / ITER);



  return 0;
}

  /*
  print_vector(p1);
  print_vector(p2);
  print_vector(v1);
  print_vector(v2);
  print_vector(a1);
  print_vector(a2);
  */
