module.exports = ({ config, mode }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [{
      loader: require.resolve("awesome-typescript-loader"),
    }],
  });

  config.resolve.extensions.push(".ts", ".tsx");
  config.node = {
    fs: 'empty',
    worker_threads: 'empty'
  };
  return config;
};
