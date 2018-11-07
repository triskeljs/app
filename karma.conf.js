/* global process */

module.exports = function(config) {

  var configuration = {
    frameworks: ['mocha', 'chai'],
    plugins: [
      'karma-mocha',
      'karma-chai',
      'karma-coverage',
      'karma-coveralls',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-story-reporter'
    ],
    files: [
      'dist/app.umd.js',
      'tests/{,**/}*-tests.js',
    ],
    // browsers: [ 'Chrome', 'Firefox' ],
    browsers: [ 'ChromeHeadless', 'FirefoxHeadless' ],
    customLaunchers: {
      Chrome_no_sandbox: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      },
    },
    singleRun: true,
    reporters: ['story', 'coverage', 'coveralls'],
    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'dist/app.umd.js': ['coverage']
    },
    coverageReporter: {
      type: 'lcov', // lcov or lcovonly are required for generating lcov.info files
      dir: 'coverage/'
    },
  };

  if(process.env.TRAVIS){
    configuration.browsers = [ 'Chrome_no_sandbox', 'Firefox' ];
    configuration.concurrency = 1;
  }

  config.set(configuration);
};
