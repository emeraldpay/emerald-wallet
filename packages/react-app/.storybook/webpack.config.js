const path = require('path');
const webpack = require('webpack');

// expects to be accessed from Electron frame as:
// $ electron stories/electron_index.js
//
// see https://github.com/storybookjs/storybook/issues/1435

module.exports = ({ config }) => {
  config.externals = {
    fs: "top.require('fs')",
    os: "top.require('os')",
    stream: "top.require('stream')",
    assert: "top.require('assert')",
    constants: "top.require('constants')",
    process: "top.require('process')",
    crypto: "top.require('crypto')",
    path: "top.require('path')",
    events: "top.require('events')",
    electron: "top.require('electron')",
    util: "top.require('util')",
    querystring: "top.require('querystring')",
    worker_threads: {},
  };

  config.module.rules.push({
    test: /\.(m?js)$/,
    resolve: {
      fullySpecified: false,
    },
  });

  config.module.rules.push({
    test: /\.tsx?$/,
    use: [
      {
        loader: require.resolve('ts-loader'),
        options: {
          configFile: path.resolve(__dirname, './tsconfig.json'),
        },
      },
    ],
  });

  config.plugins.push(
    new webpack.DefinePlugin({
      global: '(typeof(global) == "undefined" ? top.global : global)',
      process: '(typeof(process) == "undefined" ? top.process : process)',
      'window.require': 'top.window.require',
    }),
  );

  config.resolve.extensions.push('.ts', '.tsx');

  config.target = 'electron-renderer';

  return config;
};
