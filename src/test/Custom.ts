import { defaultOptions, type DefaultTypeMap } from '../options/defaultOptions';
import { type SerifyOptions } from '../types';

export class Custom {
  constructor(public p: number) {}
}

export interface CustomTypeMap extends DefaultTypeMap {
  Custom: [Custom, number];
}

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
