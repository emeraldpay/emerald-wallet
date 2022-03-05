const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isDevelopMode = process.env.NODE_ENV === 'development';

module.exports = {
  mode: isDevelopMode ? 'development' : 'production',
  entry: path.resolve(__dirname, 'src/renderer/index.tsx'),
  target: 'electron-renderer',
  devtool: isDevelopMode ? 'source-map' : false,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, '../../node_modules')],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'resources/icon.png'),
          to: './resources/',
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
    }),
  ],
  output: {
    path: path.resolve(__dirname, 'app'),
    filename: 'renderer.js',
  },
};
