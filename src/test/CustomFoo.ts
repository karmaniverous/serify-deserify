import {
  defaultOptions,
  type DefaultTypeMap,
  type SerifyOptions,
  staticTypeProperty,
} from '../';

export class CustomFoo {
  static [staticTypeProperty] = 'Foo';

  constructor(public p: number) {}
}

export interface CustomFooTypeMap extends DefaultTypeMap {
  Foo: [CustomFoo, number];
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
