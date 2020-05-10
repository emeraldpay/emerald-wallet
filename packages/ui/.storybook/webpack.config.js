const path = require('path');

module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [{
      loader: require.resolve('ts-loader'),
      options: {
        // We have to use different config because for main pkg we use
        // incremental compilation with rootDir == '/src'
        configFile: path.resolve(__dirname, './tsconfig.json')
      }
    }]
  });

  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};
