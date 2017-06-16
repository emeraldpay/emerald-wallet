const os = require('os');
const packager = require('electron-packager');
const pkg = require('./../package.json');
const webpack = require('webpack');
const webpackConfig = require('./webpack.electron.js');

const appName = pkg.productName;
const argv = require('minimist')(process.argv.slice(2));

/**
 * Configuration for electron-packager
 */
const packOpts = {
  dir: './',
  name: appName,
  overwrite: true, // overwrite release folder
  ignore: [
    '^/release($|/)',
    '^/.idea($|/)',
    '^/node_modules($|/)',
  ]
};

// Run webpack to compile main.js
webpack(webpackConfig, (err, stats) => {
  if (err) {
    console.error(err);
    return;
  }

  const platforms = (argv.all ? ['linux', 'win32'] : [os.platform()]);
  // Run electron-packager for each platform
  platforms.forEach(function(platform) {
    pack(platform, os.arch());
  })
});


function pack(platform, arch) {
  console.log(`Start packaging for ${platform}`);
  const opts = Object.assign({}, packOpts, {
    platform: platform,
    arch: arch,
    out: `release`
  });

  packager(opts, onPackFinished);
}

function onPackFinished(err, appPaths) {
  if (err) {
    return console.error(err);
  }
  console.log(`Finished ${appPaths}`)
}