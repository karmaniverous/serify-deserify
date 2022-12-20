const config = require('./babel.config');

module.exports = (api) => ({
  ...config(api),
  ignore: [/\.test\.\w+$/],
});
