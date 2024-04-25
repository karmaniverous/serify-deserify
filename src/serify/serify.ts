import { getType, isAnyObject, isArray, isPlainObject } from 'is-what';

import { type DefaultTypeMap } from '../options/defaultOptions';
import {
  isSerializablePrimitive,
  type SerifiableTypeMap,
  type SerifyOptions,
} from '../types';

/**
 * static property name to override an object's serify key
 */
export const staticTypeProperty = Symbol(
  'serify-deserify static type property',
);

/**
 * serify a value
 */
export const serify = <M extends SerifiableTypeMap = DefaultTypeMap>(
  value: unknown,
  options: SerifyOptions<M>,
): unknown => {
  if (isSerializablePrimitive(value)) return value;

  const valueType = isAnyObject(value)
    ? staticTypeProperty in value.constructor
      ? (value.constructor[staticTypeProperty] as string)
      : value.constructor.name
    : getType(value);

  if (valueType in options.types)
    return {
      serifyKey: options.serifyKey,
      type: valueType,
      value: serify(options.types[valueType].serifier(value), options),
    };

  if (isArray(value)) return value.map((v) => serify(v, options));

  if (isPlainObject(value)) {
    const copy: Record<string, unknown> = {};
    for (const p in value) copy[p] = serify(value[p], options);
    return copy;
  }

  throw new Error(`unserifiable type: ${valueType}`);
};
