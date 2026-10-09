/**
 * {@link serify}: recursively converts a value into a form `JSON.stringify` can
 * serialize, using the type callbacks in {@link SerifyOptions}. Pure; never
 * mutates its input.
 *
 * @module
 */
import { getType, isAnyObject, isArray, isPlainObject } from 'is-what';

import type { DefaultTypeMap } from '../options/defaultOptions';
import {
  isNullObject,
  isSerializablePrimitive,
  type SerifiableTypeMap,
  type SerifyOptions,
} from '../types';

/**
 * Static class property that overrides a class's type identifier in
 * {@link SerifyOptions.types}.
 *
 * @remarks
 * By default, a class instance's type identifier is its constructor's name.
 * Classes that are dynamically generated (or minified) may not have a stable
 * name; give them a static property keyed by this symbol to set the identifier
 * explicitly.
 *
 * @example
 * ```ts
 * class CustomFoo {
 *   static [serifyStaticTypeProperty] = 'Foo';
 * }
 * ```
 */
export const serifyStaticTypeProperty = Symbol('serify static type property');

/**
 * Determine a value's type identifier, i.e. its candidate key in
 * {@link SerifyOptions.types}.
 *
 * @param value - The value to identify.
 * @returns `'NullObject'` for null-prototype objects; the
 * {@link serifyStaticTypeProperty} or constructor name for class instances;
 * otherwise the `is-what` type name.
 */
const getSerifyTypeIdentifier = (value: unknown): string => {
  if (isNullObject(value)) return 'NullObject';

  if (isAnyObject(value)) {
    // Use prototype's constructor to prevent a custom `constructor` key shadowing it
    const { constructor } = Object.getPrototypeOf(value) as {
      constructor?: unknown;
    };
    if (typeof constructor === 'function')
      return serifyStaticTypeProperty in constructor
        ? String(constructor[serifyStaticTypeProperty])
        : constructor.name;
  }

  return getType(value);
};

/**
 * Serify a value: recursively convert it into a form that `JSON.stringify`
 * can serialize, and that {@link deserify} can restore.
 *
 * @typeParam M - The {@link SerifiableTypeMap} describing supported types.
 * @param value - The value to serify.
 * @param options - The {@link SerifyOptions} in effect.
 * @returns The serified value. Serializable primitives are returned as-is;
 * arrays & plain objects are cloned with serified contents; values of
 * supported types are wrapped in a {@link SerifiedValue}.
 * @throws `Error` if `value` (or any value it contains) is not of a
 * serifiable type.
 *
 * @example
 * ```ts
 * serify(new Map([['a', 1n]]), defaultOptions);
 * // {
 * //   serifyKey: null,
 * //   type: 'Map',
 * //   value: [['a', { serifyKey: null, type: 'BigInt', value: '1' }]],
 * // }
 * ```
 */
export const serify = <M extends SerifiableTypeMap = DefaultTypeMap>(
  value: unknown,
  options: SerifyOptions<M>,
): unknown => {
  if (isSerializablePrimitive(value)) return value;

  const valueType = getSerifyTypeIdentifier(value);

  if (valueType in options.types)
    return {
      serifyKey: options.serifyKey,
      type: valueType,
      value: serify(options.types[valueType].serifier(value), options),
    };

  if (isArray(value)) return value.map((v) => serify(v, options));

  if (isPlainObject(value))
    // Ensure own keys are defined as ordinary properties & exclude inherited properties
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, serify(v, options)]),
    );

  throw new Error(`unserifiable type: ${valueType}`);
};
