/**
 * Default {@link SerifyOptions}: out-of-the-box support for `BigInt`, `Date`,
 * `Map`, `Set`, `undefined`, null-prototype objects, and the numbers JSON can't
 * represent (`NaN`, `Infinity`, `-Infinity` & `-0`). Pure data.
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

  /**
   * Numbers JSON can't represent (`NaN`, `Infinity`, `-Infinity` & `-0`),
   * serified as strings. Other numbers are serializable and pass through.
   */
  Number: [number, string];
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
    Number: {
      // String(-0) is '0', so -0 needs an explicit encoding.
      serifier: (value) => (Object.is(value, -0) ? '-0' : String(value)),
      deserifier: (value) => Number(value),
    },
  },
};
