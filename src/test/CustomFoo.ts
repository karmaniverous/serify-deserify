import {
  defaultOptions,
  type DefaultTypeMap,
  type SerifyOptions,
  serifyStaticTypeProperty,
} from '../';

export class CustomFoo {
  static [serifyStaticTypeProperty] = 'Foo';

  constructor(public p: bigint) {}
}

export interface CustomFooTypeMap extends DefaultTypeMap {
  Foo: [CustomFoo, bigint];
}

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
