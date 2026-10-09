/**
 * Test fixture: a custom class identified by its constructor name, plus
 * {@link SerifyOptions} supporting it. Pure.
 *
 * @module
 */
import { defaultOptions, type DefaultTypeMap, type SerifyOptions } from '../';

/** A custom class identified by its constructor name (`Custom`). */
export class Custom {
  /**
   * @param p - A `bigint` payload, which is itself serified recursively.
   */
  constructor(public p: bigint) {}
}

/** {@link DefaultTypeMap} extended with the {@link Custom} type. */
export interface CustomTypeMap extends DefaultTypeMap {
  /** {@link Custom} instances, serified as their `bigint` payload. */
  Custom: [Custom, bigint];
}

/** {@link defaultOptions} extended to support {@link Custom}. */
export const customOptions: SerifyOptions<CustomTypeMap> = {
  ...defaultOptions,
  types: {
    ...defaultOptions.types,
    Custom: {
      serifier: (value) => value.p,
      deserifier: (value) => new Custom(value),
    },
  },
};
