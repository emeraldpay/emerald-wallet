const path = require('path');

module.exports = {
  node: {
    fs: 'empty'
  },
  module: {
    rules: [
      {
        test: /\.s?css$/,
        loader: 'style-loader!css-loader?modules&camelCase&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!sass-loader'
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader'
      }
    ]
  }
};
