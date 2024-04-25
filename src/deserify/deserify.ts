import { isArray, isPlainObject } from 'is-what';

import { type DefaultTypeMap } from '../options/defaultOptions';
import {
  isSerializablePrimitive,
  isSerifiedValue,
  type SerifiableTypeMap,
  type SerifyOptions,
} from '../types';

/**
 * deserify a value
 */
export const deserify = <M extends SerifiableTypeMap = DefaultTypeMap>(
  value: unknown,
  options: SerifyOptions<M>,
): unknown => {
  if (isSerializablePrimitive(value)) return value;

  if (isSerifiedValue(value, options)) {
    const { type, value: raw } = value;
    const parsed = deserify(raw, options);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return options.types[type].deserifier(parsed);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  if (isArray(value)) return value.map((v) => deserify(v, options));

  if (isPlainObject(value)) {
    const copy: Record<string, unknown> = {};
    for (const p in value) copy[p] = deserify(value[p], options);
    return copy;
  }

  throw new Error(`Value is not deserifiable: ${JSON.stringify(value)}`);
};
