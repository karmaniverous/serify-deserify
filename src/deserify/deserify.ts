import { isArray, isPlainObject } from 'is-what';

import { type DefaultTypeMap } from '../options/defaultOptions';
import {
  isSerializablePrimitive,
  isSerifiedValue,
  type SerifiableTypeMap,
  type SerifyOptions,
} from '../types';

const _deserify = <M extends SerifiableTypeMap = DefaultTypeMap>(
  value: unknown,
  options: SerifyOptions<M>,
): unknown => {
  if (isSerializablePrimitive(value)) return value;

  if (isSerifiedValue(value, options)) {
    const { type, value: raw } = value;
    const parsed = _deserify(raw, options);
    return options.types[type].deserifier(parsed);
  }

  if (isArray(value)) return value.map((v) => _deserify(v, options));

  if (isPlainObject(value)) {
    const copy: Record<string, unknown> = {};
    for (const p in value) copy[p] = _deserify(value[p], options);
    return copy;
  }

  throw new Error(`Value is not deserifiable: ${JSON.stringify(value)}`);
};

/**
 * Deserify a value. Clones the value prior to deserification. Implicitly
 * assumes that the value is composed entirely of serializable types and thus
 * clonable via JSON.parse(JSON.stringify(value)).
 */
export const deserify = <M extends SerifiableTypeMap = DefaultTypeMap>(
  value: unknown,
  options: SerifyOptions<M>,
): unknown => {
  let clone: typeof value;

  try {
    clone = JSON.parse(JSON.stringify(value));
  } catch {
    throw new Error(`Value is not clonable: ${JSON.stringify(value)}`);
  }

  return _deserify<M>(clone, options);
};
