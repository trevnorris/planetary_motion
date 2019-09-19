Planetary Motion Library

First install libuv. From the repo run the following:

    sh autogen.sh                              &&
    ./configure --enable-static --prefix=/usr &&
    make 

Then run the following as sudo:

    make install

To build the src/ directory run:

    clang++ -Wall -luv -std=c++11 -o planets -O2 src/planets.cc

Configure the planets using a planets.ini file that specifies the mass, position,
velocity and acceleration.
