const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const isDevelopMode = process.env.NODE_ENV === 'development';

module.exports = {
  mode: isDevelopMode ? 'development' : 'production',
  entry: path.resolve(__dirname, 'src/renderer/index.ts'),
  target: 'electron-renderer',
  devtool: isDevelopMode ? 'source-map' : false,
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react'],
        },
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(__dirname, 'tsconfig.base.json'),
        },
      },
      {
        test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    mainFields: ['browser', 'module', 'main'],
    modules: [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, '../../node_modules')],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/renderer/about.html'),
        },
        {
          from: path.resolve(__dirname, 'src/renderer/index.html'),
        },
      ],
    }),
  ],
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'app/src/renderer'),
    publicPath: '',
  },
};
