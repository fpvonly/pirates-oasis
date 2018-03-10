var webpack = require('webpack');
var path = require('path');
var GitRevisionPlugin = require('git-revision-webpack-plugin')

var BUILD_DIR = path.resolve(__dirname, 'build');
var APP_DIR  = path.resolve(__dirname, '');

var config = {
  entry: [
    APP_DIR + '/src/app.jsx'
  ],
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js',
    publicPath: '/build/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  devServer: {
    open: true,
    historyApiFallback: true
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    })
  ]
};

if (process.env.NODE_ENV === 'production') {
  config.devServer = {};
  config.bail = true;
  config.stats = 'verbose';
  config.plugins = config.plugins.concat([
    new GitRevisionPlugin()
  ]);
}

module.exports = config;
