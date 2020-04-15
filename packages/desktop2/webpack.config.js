const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = [
  // {
  //   mode: 'development',
  //   entry: path.join(__dirname, 'src/main/electron.ts'),
  //   target: 'electron-main',
  //   module: {
  //     rules: [{
  //       test: /\.(ts|tsx)$/,
  //       exclude: /node_modules/,
  //       loader: 'ts-loader',
  //     }]
  //   },
  //   // node: {
  //   //   __dirname: false,
  //   //   __filename: false
  //   // },
  //   resolve: {
  //     extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
  //     modules: [
  //       path.join(__dirname, 'node_modules'),
  //       path.join(__dirname, '../../node_modules'),
  //     ]
  //   },
  //   output: {
  //     path: __dirname + '/app',
  //     filename: 'index.js'
  //   }
  // },
  {
    mode: 'development',
    entry: './src/renderer/index.tsx',
    target: 'electron-renderer',
    devtool: 'source-map',
    module: {
      rules: [{
        test: /\.ts(x?)$/,
        include: /src/,
        use: [{loader: 'ts-loader'}]
      }]
    },
    output: {
      path: __dirname + '/app',
      filename: 'renderer.js'
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/renderer/index.html'
      }),
      new CopyWebpackPlugin([
        {from: path.join(__dirname, 'resources/icons/512x512.png'), to: './icons/'}
      ], {copyUnmodified: true}),
    ],
    resolve: {
      extensions: ['.js', '.tsx', '.ts']
    }
  }
];
