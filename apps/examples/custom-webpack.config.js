// Helper for combining webpack config objects
const { merge } = require('webpack-merge');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = (config, context) => {
  return merge(config, {
    plugins: [
      ...config.plugins,
      new CopyPlugin({
        patterns: [
          { from: '../../packages', to: 'vendor' },
        ],
      }),
    ],
  });
};
