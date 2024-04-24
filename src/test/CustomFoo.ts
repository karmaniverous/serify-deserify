import {
  defaultOptions,
  type DefaultTypeMap,
} from '../options/defaultOptions.js';
import { staticTypeProperty } from '../serify/serify.js';
import { type SerifyOptions } from '../types.js';
import { Custom } from './Custom.js';

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
      deserifier: (value) => new Custom(value),
    },
  },
};
