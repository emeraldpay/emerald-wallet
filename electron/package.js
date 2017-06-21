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
    ],
};

function onPackFinished(err, appPaths) {
    if (err) {
        return console.error(err);
    }
    return console.log(`Finished ${appPaths}`);
}

function pack(platform, arch) {
    console.log(`Start packaging for ${platform}`);
    var opts = Object.assign({}, packOpts, {
        platform,
        arch,
        icon: './icons/icon',
        out: 'release',
    });

    if (platform === 'darwin') {
        opts = Object.assign(opts, {
            appCategoryType: 'public.app-category.developer-tools',
        });
    }

    packager(opts, onPackFinished);
}

// Run webpack to compile main.js
webpack(webpackConfig, (err, stats) => {
    if (err) {
        console.error(err);
        return;
    }

    const platforms = (argv.all ? ['linux', 'win32'] : [os.platform()]);
  // Run electron-packager for each platform
    platforms.forEach((platform) => {
        pack(platform, os.arch());
    });
});
