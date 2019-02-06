const path = require('path');

module.exports = {
  node: {
    fs: 'empty'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|es6)$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/,
        query: {
          presets: ['env', 'react', 'stage-0', 'flow']
        }
      }, 
      {
        test: /\.(scss|css)$/,
        loaders: ["style-loader", "css-loader"],
        include: path.resolve(__dirname, '../')
      },
      {
        test: /\.(jpg|png|gif)$/,
        use: {
          loader: 'file-loader',
          options: {name: 'images/[name].[ext]'},
        },
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
            name: 'fonts/[name].[ext]',
          },
        },
      },
    ]
  }
}
