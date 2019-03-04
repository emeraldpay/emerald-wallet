const path = require('path');
const srcDir = path.join(__dirname, '../src');

module.exports = {
  node: {
    fs: 'empty'
  },
  resolve: {
    modules: [
      // Add src/ dir for resolving for i18next-resource-store-loader
      path.resolve(srcDir),
      path.join(__dirname, '../node_modules')
    ]
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
