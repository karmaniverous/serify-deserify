/**
 * Reversibly transform unserializable values (`BigInt`, `Date`, `Map`, `Set`,
 * `undefined`, custom classes…) into serializable ones with {@link serify},
 * and back again with {@link deserify}. Includes Redux middleware.
 *
 * @packageDocumentation
 */

export { createReduxMiddleware } from './createReduxMiddleware/createReduxMiddleware';
export { deserify } from './deserify/deserify';
export { defaultOptions, type DefaultTypeMap } from './options/defaultOptions';
export { serify, serifyStaticTypeProperty } from './serify/serify';
export type {
  SerializablePrimitive,
  SerifiableTypeMap,
  SerifiedValue,
  SerifyOptions,
  SerifyOptionTypeCallbacks,
} from './types';
