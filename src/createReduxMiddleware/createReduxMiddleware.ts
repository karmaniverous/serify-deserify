import type { Middleware } from '@reduxjs/toolkit';
import { isAnyObject } from 'is-what';

import { serify } from '../serify/serify';
import type { SerifiableTypeMap, SerifyOptions } from '../types';

/**
 * create redux middleware
 */
export const createReduxMiddleware =
  <M extends SerifiableTypeMap>(
    options: SerifyOptions<M>,
    // eslint-disable-next-line @typescript-eslint/ban-types
  ): Middleware =>
  () =>
  (next) =>
  (action) => {
    if (isAnyObject(action)) action.payload = serify(action.payload, options);
    next(action);
  };
