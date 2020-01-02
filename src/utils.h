#ifndef UTILS_H_
#define UTILS_H_

#include <chrono>

#define G 6.67408e-11
#define AU 149597870700
#define PI 3.141592653589793

uint64_t hrtime() {
  return std::chrono::duration_cast<std::chrono::nanoseconds>(
      std::chrono::steady_clock::now().time_since_epoch()).count();
}

#endif  // UTILS_H_
