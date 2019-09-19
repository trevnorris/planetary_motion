#include "deps/inih.h"
#include "deps/cxxopts.h"

#include <uv.h>

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
#define AU 149597870000

struct SolarSystem;
struct Planet;
static void printSystem(SolarSystem* ssm, Planet*);
static void printPlanet(Planet* p, Planet* sun);
static inline void add_acceleration(Planet* p1, Planet* p2);
static inline void add_position_velocity(Planet* p1, double t);

static uint64_t hrtime() {
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
  Planet(string n,
         double m,
         vector<double> p,
         vector<double> v,
         vector<double> a)
    : name(n), mass(m) {
    pos = { p[0], p[1], p[2] };
    vel = { v[0], v[1], v[2] };
    acc = { a[0], a[1], a[2] };
  }
  string name;
  double mass;
  Coord pos;
  Coord vel;
  Coord acc;
};


struct SolarSystem {
  SolarSystem() { }
  SolarSystem(vector<Planet*> p) : planets(p) { }
  vector<Planet*> planets;
  void step(uint64_t t) {
    for (auto b1 : planets) {
      b1->acc = { 0, 0, 0 };
      for (auto b2 : planets) {
        if (b1 == b2) {
          continue;
        }
        add_acceleration(b1, b2);
      }
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


static vector<double> parse_coord(string vals) {
  vector<double> coord;
  stringstream ss(vals);
  string num;
  while (getline(ss, num, ',')) {
    coord.push_back(stod(num));
  }
  return coord;
}


static Planet* gen_planet(INIReader* reader, const char* name) {
  double mass = reader->GetReal(name, "mass", 0);
  vector<double> pos = parse_coord(reader->Get(name, "position", "0,0,0"));
  vector<double> vel = parse_coord(reader->Get(name, "velocity", "0,0,0"));
  vector<double> acc = parse_coord(reader->Get(name, "acceleration", "0,0,0"));
  return new Planet(name, mass, pos, vel, acc);
}


static SolarSystem* generate_solar_system(const char* ini_realpath) {
  INIReader reader(ini_realpath);
  vector<Planet*> planets;

  if (reader.ParseError() != 0) {
    fprintf(stderr, "can't load '%s'\n", ini_realpath);
    return nullptr;
  }

  for (auto elem : reader.Sections()) {
    planets.push_back(gen_planet(&reader, elem.c_str()));
  }

  return new SolarSystem(planets);
}


// TODO: Fix this horrible ugliness...
uint64_t t;
size_t STEP_SEC;
size_t iter;
SolarSystem* ssm;
Planet* sun;
void s_handler(int s) {
  printf("%c[2K\r", 27);
  t = hrtime() - t;
  printSystem(ssm, sun);
  printf("step: %lu    iter: %lu   %.2f ns/iter   %.2f minutes\n",
         STEP_SEC,
         iter,
         1.0 * t / iter,
         1.0 * t / 1e9 / 60);
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
  //printSystem(ssm, ssm->get_planet("sun"));

  //size_t STEP_SEC = 1;
  //uint64_t DUR = 1e9 * 10;   // 1e9 is 1 sec
  uint64_t DUR = 1e9 * result["duration"].as<uint64_t>();   // 1e9 is 1 sec
  uint64_t YEARS = result["years"].as<uint64_t>();
  STEP_SEC = result["step"].as<size_t>();
  iter = 0;

  printSystem(ssm, sun);
  printf("\n");

  t = hrtime();

  if (YEARS > 0) {
    for (size_t i = 0; i < YEARS * STEP_SEC * 86400 * 365.256; i += STEP_SEC) {
      iter++;
      ssm->step(STEP_SEC);
    }
  } else {
    do {
      for (size_t i = 0; i < 100000; i++) {
        iter++;
        ssm->step(STEP_SEC);
      }
    } while (hrtime() - t < DUR);
  }

  t = hrtime() - t;
  printSystem(ssm, sun);
  printf("step: %lu    iter: %lu   %.2f ns/iter   %.2f minutes\n",
         STEP_SEC,
         iter,
         1.0 * t / iter,
         1.0 * t / 1e9 / 60);
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


static inline void add_acceleration(Planet* p1, Planet* p2) {
  double x = p1->pos.x - p2->pos.x;
  double y = p1->pos.y - p2->pos.y;
  double z = p1->pos.z - p2->pos.z;
  double m = 1 / sqrt(x * x + y * y + z * z);
  double pre = -G * p2->mass * m * m;
  p1->acc.x += pre * x * m;
  p1->acc.y += pre * y * m;
  p1->acc.z += pre * z * m;
}


static inline void add_position_velocity(Planet* p1, double t) {
  double tsq = t * t * 0.5;
  p1->pos.x += p1->vel.x * t + p1->acc.x * tsq;
  p1->pos.y += p1->vel.y * t + p1->acc.y * tsq;
  p1->pos.z += p1->vel.z * t + p1->acc.z * tsq;
  p1->vel.x += p1->acc.x * t;
  p1->vel.y += p1->acc.y * t;
  p1->vel.z += p1->acc.z * t;
}


static void printSystem(SolarSystem* ssm, Planet* sun) {
  printPlanet(sun, sun);
  for (auto p : ssm->planets) {
    if (p->name == sun->name) continue;
    printPlanet(p, sun);
  }
}


static double len(Coord& c1) {
  return sqrt(c1.x * c1.x + c1.y * c1.y + c1.z * c1.z);
}


static inline double mag(Coord* c1, Coord* c2) {
  return sqrt(pow(c1->x - c2->x, 2) + pow(c1->y - c2->y, 2) +
      pow(c1->z - c2->z, 2));
}


static void printPlanet(Planet* p, Planet* sun) {
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
