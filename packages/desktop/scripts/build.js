const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const watch = process.argv.indexOf('--no-watch') < 0;

const config = require('../webpack.config.js');

// var electronCompiler = webpack(require('./electron/webpack.electron'));
const compiler = webpack(config);
const statOpts = {
  hash: true,
  timing: true,
  assets: true,
  chunks: false,
  children: false,
  version: false,
};

if (watch) {
  compiler.watch({}, (err, stats) => {
    console.log(stats.toString(statOpts));
  });
} else {
  // electronCompiler.run(function (err, stats) {
  //     console.log(stats.toString(statOpts));
  // });
  compiler.run((err, stats) => {
    console.log(stats.toString(statOpts));
  });
}
