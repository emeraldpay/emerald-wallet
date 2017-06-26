var fs = require('fs');
var path = require('path');
var webpack = require('webpack');

var config = require('./webpack.electron.js');

var watch = process.argv.indexOf('--no-watch') < 0;

var compiler = webpack(config);
var statOpts = {
    hash: true,
    timing: true,
    assets: true,
    chunks: false,
    children: false,
    version: false,
};

if (watch) {
    compiler.watch({}, function (err, stats) {
        console.log(stats.toString(statOpts));
    });
} else {
    compiler.run(function (err, stats) {
        console.log(stats.toString(statOpts));
    });
}
