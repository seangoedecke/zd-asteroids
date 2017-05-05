const webpack = require('webpack'); //to access built-in plugins

module.exports = {
  entry: './src/asteroids.js',
  output: {
    filename: 'bundle.js',
    path: './'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }],
  }
}
