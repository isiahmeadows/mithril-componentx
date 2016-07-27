var webpack = require('webpack');
var UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

module.exports = {
  target: 'web',
  entry: './src/index.js',
  output: {
    path: __dirname + '/dist/',
    filename: 'component.min.js',
    library: 'component',
    libraryTarget: 'var'
  },
  externals: {
  },
  module: {
    loaders: [
      {test: /\.js/, loader: "babel", include: __dirname + "/index.js"}
    ]
  },
  plugins: [
    new UglifyJsPlugin()
  ]
};
