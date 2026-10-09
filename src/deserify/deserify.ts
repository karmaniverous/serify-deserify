import { isArray, isPlainObject } from 'is-what';

import { type DefaultTypeMap } from '../options/defaultOptions';
import {
  isSerializablePrimitive,
  isSerifiedValue,
  type SerifiableTypeMap,
  type SerifyOptions,
} from '../types';

/**
 * Deserify a value. Does not mutate the original value. Implicitly assumes
 * that the value is composed entirely of types serializable by JSON.stringify.
 */
export const deserify = <M extends SerifiableTypeMap = DefaultTypeMap>(
  value: unknown,
  options: SerifyOptions<M>,
): unknown => {
  if (isSerializablePrimitive(value)) return value;

  if (isSerifiedValue(value, options)) {
    const { type, value: raw } = value;
    const parsed = deserify(raw, options);
    return options.types[type].deserifier(parsed);
  }

  if (isArray(value)) return value.map((v) => deserify(v, options));

  if (isPlainObject(value))
    // Ensure own keys are defined as ordinary properties & exclude inherited properties
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, deserify(v, options)]),
    );

  throw new Error(`Value is not deserifiable: ${JSON.stringify(value)}`);
};
