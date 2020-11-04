{
  'targets': [{
    'target_name': 'addon',
    'sources': [ 'src/motion.cc' ],
    'target_defaults': {
      'default_configuration': 'Release',
      'configurations': {
        'Debug': {
          'defines': [ 'DEBUG', '_DEBUG' ],
          'cflags': [ '-g', '-O0', '-fstandalone-debug' ],
        }
      },
    },
  }],
}
