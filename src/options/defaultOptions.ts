import type { SerifiableTypeMap, SerifyOptions } from '../types.js';

export interface DefaultTypeMap extends SerifiableTypeMap {
  BigInt: [bigint, string];
  Date: [Date, number];
  Map: [Map<unknown, unknown>, [unknown, unknown][]];
  Set: [Set<unknown>, unknown[]];
  Undefined: [undefined, null];
}

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
  },
};
