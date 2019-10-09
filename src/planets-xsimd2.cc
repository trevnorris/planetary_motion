// Built with:
//  clang++ -O3 -Wall -luv -march=native -mtune=native -fopenmp -std=c++14 \
//    -o planets_xsimd planets-xsimd.cc

#include <xsimd/xsimd.hpp>

#include <vector>

#include <iostream>

#define G 6.67408e-11
#define AU 149597870000

namespace xs = xsimd;

using std::string;
using std::vector;

using db_batch = xs::batch<double, 4>;

struct Planet {
  Planet() : name(""), mass(0), pos(0.0), vel(0.0), acc(0.0) {
  }

  Planet(string n, double m) : name(n), mass(m), pos(0.0), vel(0.0), acc(0.0) {
  }

  void init(string n,
            double m,
            vector<double> p,
            vector<double> v,
            vector<double> a) {
    pos = xs::load_unaligned(p.data());
    vel = xs::load_unaligned(v.data());
    acc = xs::load_unaligned(a.data());
  }

  string name;
  double mass;

  db_batch pos;
  db_batch vel;
  db_batch acc;
};

int main(int argc, char* argv[]) {
  //auto p1 = new Planet("foo", 1);
  vector<double> r = { 4, 5, 6, 0 };

  Planet planets[10];

  auto earth = &planets[1];

  earth->init("earth", 42, r, r, r);

  auto f = earth->pos + earth->vel;

  std::cout << f[0] << f[1] << f[2] << f[3] << '\n';

  /*
  auto f = p1->pos_b + p1->acc_b;

  std::cout << f[0] << f[1] << f[2] << f[3] << '\n';
  */

  return 0;
}
