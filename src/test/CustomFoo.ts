/**
 * Test fixture: a custom class identified by a
 * {@link serifyStaticTypeProperty} static property, plus
 * {@link SerifyOptions} supporting it. Pure.
 *
 * @module
 */
import {
  defaultOptions,
  type DefaultTypeMap,
  type SerifyOptions,
  serifyStaticTypeProperty,
} from '../';

/** A custom class identified by its static type property (`Foo`). */
export class CustomFoo {
  /** Overrides the type identifier used in {@link SerifyOptions.types}. */
  static [serifyStaticTypeProperty] = 'Foo';

  /**
   * @param p - A `bigint` payload, which is itself serified recursively.
   */
  constructor(public p: bigint) {}
}

/** {@link DefaultTypeMap} extended with the {@link CustomFoo} type. */
export interface CustomFooTypeMap extends DefaultTypeMap {
  /** {@link CustomFoo} instances, serified as their `bigint` payload. */
  Foo: [CustomFoo, bigint];
}

/** {@link defaultOptions} extended to support {@link CustomFoo}. */
export const customFooOptions: SerifyOptions<CustomFooTypeMap> = {
  ...defaultOptions,
  types: {
    ...defaultOptions.types,
    Foo: {
      serifier: (value) => value.p,
      deserifier: (value) => new CustomFoo(value),
    },
  },
};
