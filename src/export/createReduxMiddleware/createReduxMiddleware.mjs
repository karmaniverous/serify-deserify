import { serify } from '../serify/serify.mjs';

import '../options/types.mjs';

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
