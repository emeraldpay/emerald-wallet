const path = require('path');
const webpack = require('webpack');

module.exports = ({ config }) => {
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
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  );

  config.resolve.extensions.push('.ts', '.tsx');

  config.resolve.fallback.http = require.resolve('stream-http');
  config.resolve.fallback.https = require.resolve('https-browserify');
  config.resolve.fallback.stream = require.resolve('stream-browserify');
  config.resolve.fallback.zlib = require.resolve('browserify-zlib');
  config.resolve.fallback._stream_transform = require.resolve('readable-stream');

  return config;
};
