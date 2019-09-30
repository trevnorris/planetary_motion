// Built with:
// clang++ -O3 -Wall -luv -march=native -mtune=native -fopenmp -std=c++14 \
//  -o planets_xsimd src/planets-xsimd.cc

#include "deps/inih.h"
#include "deps/cxxopts.h"

#include <xsimd/xsimd.hpp>
#include <uv.h>
#include <signal.h>

#include <chrono>
#include <cmath>
#include <sstream>
#include <string>
#include <vector>

namespace xs = xsimd;

using std::pow;
using std::sqrt;
using std::stod;
using std::string;
using std::stringstream;
using std::vector;

using db_vector = vector<double, xs::aligned_allocator<double, 32>>;
using db_batch = xs::batch<double, 4>;

#define G 6.67408e-11
#define AU 149597870000

// TODO: Fix this horrible ugliness...
uint64_t hrtime_t;
size_t STEP_SEC;
size_t iter;

struct SolarSystem;
struct Planet;

void printSystem(SolarSystem* ssm, Planet*);
void printPlanet(Planet* p, Planet* sun);
void add_position_velocity(Planet* p1, double t);
void add_acceleration(Planet* p1, Planet* p2);

SolarSystem* ssm = nullptr;
Planet* sun = nullptr;


static uint64_t hrtime() {
  return std::chrono::duration_cast<std::chrono::nanoseconds>(
      std::chrono::steady_clock::now().time_since_epoch()).count();
}


struct Planet {
  Planet() = delete;

  Planet(string n, double m)
    : name(n), mass(m), pos(4, 0), vel(4, 0), acc(4, 0) {
  }

  Planet(string n,
         double m,
         vector<double> p,
         vector<double> v,
         vector<double> a)
    : name(n),
      mass(m),
      pos(p.begin(), p.end()),
      vel(v.begin(), v.end()),
      acc(a.begin(), a.end()) {
  }

  string name;
  double mass;

  db_vector pos;
  db_vector vel;
  db_vector acc;
};


struct SolarSystem {
  SolarSystem() { }
  SolarSystem(vector<Planet*> p) : planets(p) { }

  vector<Planet*> planets;

  // TODO: Implement collision detection. To do this will need the radius of
  // each planet, then need to used the distance between them.
  void step(uint64_t t) {
    for (auto& b1 : planets) {
      std::fill(b1->acc.begin(), b1->acc.end(), 0);
    }
    for (size_t i = 0; i < planets.size(); i++) {
      auto b1 = planets[i];
      for (size_t j = i + 1; j < planets.size(); j++) {
        add_acceleration(b1, planets[j]);
      }
    }
    for (auto& b1 : planets) {
      add_position_velocity(b1, t);
    }
  }

  Planet* get_planet(string name) {
    for (auto planet : planets) {
      if (planet->name == name) {
        return planet;
      }
    }
    return nullptr;
  }
};

cxxopts::Options* retrieve_options() {
  auto options = new cxxopts::Options(
      "Planetary Motion", "Calculate the planetary motion for a solar system");
  options->add_options()
    ("p,planets",
     "path to planets.ini",
     cxxopts::value<string>()->default_value("planets.ini"))
    ("h,help", "print help")
    ("s,step",
     "time in seconds (as double) each calculation should take",
     cxxopts::value<size_t>()->default_value("1"))
    ("d,duration",
     "how long, in seconds, the calculation should go",
     cxxopts::value<uint64_t>()->default_value("10"))
    ("y,years",
     "how many earth years the test should proceed",
     cxxopts::value<uint64_t>()->default_value("0"));
  return options;
}


// TODO: Enforce only having 3 values.
vector<double> parse_coord(string name) {
  vector<double> coord;
  stringstream ss(name);
  string num;
  while (getline(ss, num, ',')) {
    coord.push_back(stod(num));
  }
  coord.push_back(0);
  return coord;
}


Planet* gen_planet(INIReader* reader, const char* name) {
  double mass = reader->GetReal(name, "mass", 0);
  vector<double> pos = parse_coord(reader->Get(name, "position", "0,0,0"));
  vector<double> vel = parse_coord(reader->Get(name, "velocity", "0,0,0"));
  vector<double> acc = parse_coord(reader->Get(name, "acceleration", "0,0,0"));
  return new Planet(name, mass, pos, vel, acc);
}


SolarSystem* generate_solar_system(const char* ini_realpath) {
  INIReader reader(ini_realpath);
  vector<Planet*> planets;

  if (reader.ParseError() != 0) {
    fprintf(stderr, "can't load '%s'\n", ini_realpath);
    return nullptr;
  }

  for (auto elem : reader.Sections()) {
    planets.push_back(gen_planet(&reader, elem.c_str()));
    gen_planet(&reader, elem.c_str());
  }

  return new SolarSystem(planets);
}


void s_handler(int s) {
  printf("%c[2K\r", 27);
  hrtime_t = hrtime() - hrtime_t;
  printSystem(ssm, sun);
  printf("step: %lu    iter: %lu   %.2f ns/iter   %.2f minutes\n",
         STEP_SEC,
         iter,
         1.0 * hrtime_t / iter,
         1.0 * hrtime_t / 1e9 / 60);
  printf("%.2f years computed\n",
         1.0 * iter * STEP_SEC / 60 / 60 / 24 / 365.256);
  exit(0);
}


int main(int argc, char* argv[]) {
  struct sigaction sigIntHandler;
  uv_fs_t ini_path_fs;
  int err;

  sigIntHandler.sa_handler = s_handler;
  sigemptyset(&sigIntHandler.sa_mask);
  sigIntHandler.sa_flags = 0;

  sigaction(SIGINT, &sigIntHandler, nullptr);

  cxxopts::Options* options = retrieve_options();
  auto result = options->parse(argc, argv);
  auto ini_path = result["planets"].as<string>().c_str();

  if (result.count("help")) {
    printf("%s", options->help({""}).c_str());
    return 0;
  }

  err = uv_fs_realpath(nullptr, &ini_path_fs, ini_path, nullptr);

  if (err == UV_ENOENT) {
    fprintf(stderr, "%s file does not exist\n", ini_path);
    return 1;
  } else if (err) {
    fprintf(stderr, "planets ini file error: %s\n", uv_err_name(err));
    return 1;
  }

  ssm = generate_solar_system(static_cast<char*>(ini_path_fs.ptr));
  uv_fs_req_cleanup(&ini_path_fs);

  if (ssm == nullptr) {
    return 1;
  }

  sun = ssm->get_planet("sun");
  //sun = ssm->get_planet("jupiter");
  //printSystem(ssm, ssm->get_planet("sun"));

  uint64_t DUR = 1e9 * result["duration"].as<uint64_t>();   // 1e9 is 1 sec
  uint64_t YEARS = result["years"].as<uint64_t>();
  STEP_SEC = result["step"].as<size_t>();
  iter = 0;

  printSystem(ssm, sun);
  printf("\n");

  hrtime_t = hrtime();

  if (YEARS > 0) {
    for (size_t i = 0; i < YEARS * 86400 * 365.256; i += STEP_SEC) {
      iter++;
      ssm->step(STEP_SEC);
    }
  } else {
    do {
      for (size_t i = 0; i < 100000; i++) {
        iter++;
        ssm->step(STEP_SEC);
      }
    } while (hrtime() - hrtime_t < DUR);
  }

  hrtime_t = hrtime() - hrtime_t;
  printSystem(ssm, sun);
  printf("step: %lu    iter: %lu   %.2f ns/iter   %.2f minutes\n",
         STEP_SEC,
         iter,
         1.0 * hrtime_t / iter,
         1.0 * hrtime_t / 1e9 / 60);
  printf("%.2f years computed\n",
         1.0 * iter * STEP_SEC / 86400 / 365.256);

  delete options;
  for (auto p : ssm->planets) {
    delete p;
  }
  ssm->planets.clear();
  delete ssm;
  return 0;
}


void add_position_velocity(Planet* p1, double t) {
  db_batch p1_pos(p1->pos.data(), xs::aligned_mode());
  db_batch p1_vel(p1->vel.data(), xs::aligned_mode());
  db_batch p1_acc(p1->acc.data(), xs::aligned_mode());

  xs::store_aligned(p1->pos.data(), p1_pos + (p1_vel * t) + (p1_acc * t * t));
  xs::store_aligned(p1->vel.data(), p1_vel + (p1_acc * t));
}


void add_acceleration(Planet* p1, Planet* p2) {
  db_batch p1_pos(p1->pos.data(), xs::aligned_mode());
  db_batch p1_acc(p1->acc.data(), xs::aligned_mode());
  db_batch p2_pos(p2->pos.data(), xs::aligned_mode());
  db_batch p2_acc(p2->acc.data(), xs::aligned_mode());

  auto dd = p1_pos - p2_pos;
  auto dsq = dd * dd;
  double mx = 1 / sqrt(dsq[0] + dsq[1] + dsq[2]);
  double pre;
  pre = -G * p2->mass * mx * mx;
  xs::store_aligned(p1->acc.data(), p1_acc + dd * pre * mx);
  pre = -G * p1->mass * mx * mx;
  xs::store_aligned(p2->acc.data(), p2_acc + dd * pre * mx);
}


void printSystem(SolarSystem* ssm, Planet* sun) {
  printPlanet(sun, sun);
  for (auto p : ssm->planets) {
    if (sun != nullptr && p->name == sun->name) continue;
    printPlanet(p, sun);
  }
}


double len(db_vector c1) {
  return sqrt(c1[0] * c1[0] + c1[1] * c1[1] + c1[2] * c1[2]);
}


double mag(db_vector c1, db_vector c2) {
  return sqrt(pow(c1[0] - c2[0], 2) +
              pow(c1[1] - c2[1], 2) +
              pow(c1[2] - c2[2], 2));
}


void printPlanet(Planet* p, Planet* sun) {
  if (p == nullptr) return;
  printf("[%s]\n", p->name.c_str());
  printf("  [position]  x: %-14.3fy: %-14.3fz: %.3f\n",
         p->pos[0] / AU,
         p->pos[1] / AU,
         p->pos[2] / AU);
  //printf("  [velocity]  x: %-14gy: %-14gz: %g\n",
         //p->vel[0],
         //p->vel[1],
         //p->vel[2]);
  if (sun == nullptr) return;
  printf("  to %s: %-12.4f wobble: %-12.4f vel: %.1f\n",
         sun->name.c_str(),
         mag(p->pos, sun->pos) / AU,
         (len(p->pos) / AU) - (mag(p->pos, sun->pos) / AU),
         len(p->vel));
}
