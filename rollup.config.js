var resolve = require('rollup-plugin-node-resolve')
var commonjs = require('rollup-plugin-commonjs')

export default {
  plugins: [
    resolve({
      module: true, // Default: true
      browser: true,  // Default: false
    }),
    commonjs({
      // include: 'node_modules/**',
    }),
  ],
}
