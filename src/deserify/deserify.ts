/**
 * {@link deserify}: recursively restores a value produced by {@link serify}
 * (typically after a `JSON.stringify`/`JSON.parse` round trip), using the type
 * callbacks in {@link SerifyOptions}. Pure; never mutates its input.
 *
 * @module
 */
import { isArray, isPlainObject } from 'is-what';

import type { DefaultTypeMap } from '../options/defaultOptions';
import {
  isSerializablePrimitive,
  isSerifiedValue,
  type SerifiableTypeMap,
  type SerifyOptions,
} from '../types';

/**
 * Deserify a value: recursively restore every {@link SerifiedValue} it
 * contains to its original type.
 *
 * @typeParam M - The {@link SerifiableTypeMap} describing supported types.
 * @param value - The value to deserify. Implicitly assumed to be composed
 * entirely of types serializable by `JSON.stringify`.
 * @param options - The {@link SerifyOptions} in effect. Must match those used
 * to serify the value.
 * @returns The deserified value. Arrays & plain objects are cloned; the input
 * is never mutated.
 * @throws `Error` if `value` (or any value it contains) is not deserifiable.
 *
 * @example
 * ```ts
 * deserify({ serifyKey: null, type: 'BigInt', value: '42' }, defaultOptions);
 * // 42n
 * ```
 */
export const deserify = <M extends SerifiableTypeMap = DefaultTypeMap>(
  value: unknown,
  options: SerifyOptions<M>,
): unknown => {
  if (isSerializablePrimitive(value)) return value;

  if (isSerifiedValue(value, options)) {
    const { type, value: raw } = value;
    const parsed = deserify(raw, options);
    return options.types[type].deserifier(parsed);
  }

  if (isArray(value)) return value.map((v) => deserify(v, options));

  if (isPlainObject(value))
    // Ensure own keys are defined as ordinary properties & exclude inherited properties
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, deserify(v, options)]),
    );

  throw new Error(`Value is not deserifiable: ${JSON.stringify(value)}`);
};
