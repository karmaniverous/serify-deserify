// Load data from package.json.
const { version } = require('./package.json');

// Create environment variables from sources it might be undesirable to expose
// at run time.
process.env.NODE_PACKAGE_VERSION = version;

module.exports = (api) => {
  api.cache.never();

  return {
    presets: ['@babel/preset-env'],
    plugins: [
      '@babel/plugin-syntax-import-assertions',
      'lodash',
      ['module-extension', { mjs: '' }],
      [
        'transform-inline-environment-variables',
        {
          // Any environment variables you add to this array will be replaced
          // with string literals of their values at build time.
          include: ['NODE_PACKAGE_VERSION'],
        },
      ],
    ],
    targets: { node: 'current' },
  };
};
