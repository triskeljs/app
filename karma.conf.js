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
      'karma-story-reporter',
      'karma-mocha-reporter',
    ],
    files: [
      'tests/_karma-app.js',
      'tests/{,**/}*-tests.js',
      'node_modules/@triskel/con-text/tests/{,**/}*-tests.js',
      'node_modules/@triskel/render/tests/{,**/}*-tests.js',
    ],
    // browsers: [ 'Chrome', 'Firefox' ],
    browsers: [ 'Chrome_no_sandbox', 'FirefoxHeadless' ],
    customLaunchers: {
      Chrome_no_sandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'],
      },
    },
    singleRun: true,
    reporters: ['story', 'mocha', 'coverage', 'coveralls'],
    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'tests/_karma-app.js': ['coverage'],
    },
    coverageReporter: {
      type: 'lcov', // lcov or lcovonly are required for generating lcov.info files
      dir: 'coverage/'
    },
  }

  if( process.env.TRAVIS ) {
    configuration.browsers = [ 'Chrome_no_sandbox', 'Firefox' ]
    configuration.concurrency = 1
  }

  if( process.env.DRONE ) {
    configuration.browsers = [ 'Chrome_no_sandbox' ]
  }

  config.set(configuration)
}
