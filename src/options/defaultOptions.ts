/**
 * Default {@link SerifyOptions}: out-of-the-box support for `BigInt`, `Date`,
 * `Map`, `Set`, `undefined`, and null-prototype objects. Pure data.
 *
 * @module
 */
import type { SerifiableTypeMap, SerifyOptions } from '../types';

/**
 * {@link SerifiableTypeMap} describing the types supported by
 * {@link defaultOptions}.
 *
 * @remarks
 * Extend this interface to add custom types to the default set.
 */
export interface DefaultTypeMap extends SerifiableTypeMap {
  /** `bigint` values, serified as decimal strings. */
  BigInt: [bigint, string];

  /** `Date` values, serified as epoch milliseconds. */
  Date: [Date, number];

  /** `Map` values, serified as arrays of entries. */
  Map: [Map<unknown, unknown>, [unknown, unknown][]];

  /** `Set` values, serified as arrays of values. */
  Set: [Set<unknown>, unknown[]];

  /** `undefined`, serified as `null`. */
  Undefined: [undefined, null];

  /** Null-prototype objects, serified as plain objects. */
  NullObject: [object, object];
}

/**
 * Default {@link SerifyOptions}, supporting every type in
 * {@link DefaultTypeMap} with a `null` {@link SerifyOptions.serifyKey}.
 *
 * @example
 * ```ts
 * const serified = serify(42n, defaultOptions);
 * // { serifyKey: null, type: 'BigInt', value: '42' }
 * ```
 */
export const defaultOptions: SerifyOptions<DefaultTypeMap> = {
  serifyKey: null,
  types: {
    BigInt: {
      serifier: (value) => value.toString(),
      deserifier: (value) => BigInt(value),
    },
    Date: {
      serifier: (value) => value.getTime(),
      deserifier: (value) => new Date(value),
    },
    Map: {
      serifier: (value) => [...value.entries()],
      deserifier: (value) => new Map(value),
    },
    Set: {
      serifier: (value) => [...value.values()],
      deserifier: (value) => new Set(value),
    },
    Undefined: {
      serifier: () => null,
      deserifier: () => undefined,
    },
    NullObject: {
      serifier: (value) => ({ ...value }),
      deserifier: (value) =>
        Object.assign(Object.create(null) as object, value),
    },
  },
};
