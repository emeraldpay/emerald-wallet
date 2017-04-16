const os = require('os');
const packager = require('electron-packager');
const pkg = require('./../package.json');
const webpack = require('webpack');
const webpackConfig = require('./webpack.electron.js');

const appName = pkg.productName;

/**
 * Configuration for electron-packager
 */
const packOpts = {
  dir: './',
  name: appName,
  platform: os.platform(),
  arch: os.arch(),
  overwrite: true, // overwrite release folder
  ignore: [
    '^/release($|/)',
    '^/.idea($|/)',
    '^/node_modules($|/)',
  ]
}

// Run webpack to compile main.js
webpack(webpackConfig, (err, stats) => {
  if (err) {
    console.error(err);
    return;
  }

  // Run electron-packager
  pack();
});


function pack() {
  console.log("Start packaging...")
  const opts = Object.assign({}, packOpts, {
    out: `release`
  });

  packager(opts, onPackFinished);
}

function onPackFinished(err, appPaths) {
  if (err) return console.error(err);
  console.log("Finished")
}