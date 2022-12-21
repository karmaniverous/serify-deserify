import { serify } from '../serify/serify.js';

import '../options/types.js';

/**
 * create redux middleware
 *
 * @function createReduxMiddleware
 *
 * @param  {Options} [options] - options object
 *
 * @returns {function} redux middleware
 */
export const createReduxMiddleware = (options) => () => (next) => (action) => {
  action.payload = serify(action.payload, options);
  next(action);
};
