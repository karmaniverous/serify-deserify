/**
 * callback to serify a custom type.
 *
 * @callback serifierCallback
 *
 * @param {*} value - unserified value
 *
 * @returns {*} serified value
 */

/**
 * callback to deserify a custom type.
 *
 * @callback deserifierCallback
 *
 * @param {*} value - serified value
 *
 * @returns {*} unserified value
 */

/**
 * serify-deserify options type
 *
 * @typedef {Object} OptionsType
 *
 * @property {serifierCallback} serifier - serifier callback
 * @property {deserifierCallback} deserifier - deserifier callback
 */

/**
 * serify-deserify options types
 *
 * @typedef {Object} OptionsTypes
 *
 * @property {...OptionsType} [types] - supported types
 */

/**
 * serify-deserify options object
 *
 * @typedef {Object} Options
 *
 * @property {string} [serifyKey] - serify key
 * @property {OptionsTypes} types - types object
 */
