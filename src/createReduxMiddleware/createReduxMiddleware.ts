/**
 * {@link createReduxMiddleware}: builds Redux middleware that serifies the
 * `payload` of every dispatched action. Mutates the dispatched action object.
 *
 * @module
 */
import type { Middleware } from '@reduxjs/toolkit';
import { isAnyObject } from 'is-what';

import { serify } from '../serify/serify';
import type { SerifiableTypeMap, SerifyOptions } from '../types';

/**
 * Create Redux middleware that {@link serify | serifies} the `payload` of
 * every dispatched action before it reaches the reducers.
 *
 * @remarks
 * Values retrieved from the store remain serified; restore them with
 * {@link deserify} (e.g. by wrapping your selectors).
 *
 * @typeParam M - The {@link SerifiableTypeMap} describing supported types.
 * @param options - The {@link SerifyOptions} in effect.
 * @returns Redux middleware. It returns the result of passing the action down
 * the chain, so `dispatch` return values are preserved.
 *
 * @example
 * ```ts
 * const store = configureStore({
 *   reducer,
 *   middleware: (getDefaultMiddleware) =>
 *     getDefaultMiddleware().concat(createReduxMiddleware(defaultOptions)),
 * });
 * ```
 */
export const createReduxMiddleware =
  <M extends SerifiableTypeMap>(options: SerifyOptions<M>): Middleware =>
  () =>
  (next) =>
  (action) => {
    if (isAnyObject(action)) action.payload = serify(action.payload, options);
    return next(action);
  };
