const { version } = require('../../package.json');

/**
 * @typedef {Object} PackageInfo
 *
 * @property {string} version - package version
 */

/** @constant {PackageInfo} */
module.exports.PACKAGE_INFO = { version };
