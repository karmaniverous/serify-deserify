import { isPlainObject, isPrimitive } from 'is-what';

import defaultOptions from './options.mjs';

const mergeOptions = (options = {}) => ({
  serifyKey: options.serifyKey ?? defaultOptions.serifyKey,
  types: { ...defaultOptions.types, ...options.types },
});

const serifyNode = (value, options) => {
  if (isPrimitive(value) || value.serifyKey === options.serifyKey) return value;

  const valueType = value.constructor?.name;
  const serifyType = options.types[valueType];

  if (serifyType) {
    if (typeof serifyType.serifier !== 'function')
      throw new Error(`invalid ${valueType} serifier`);

    const serified = {
      serifyKey: options.serifyKey,
      type: valueType,
      value: serifyNode(serifyType.serifier(value), options),
    };

    return serified;
  }

  const descriptors = Object.getOwnPropertyDescriptors(value);
  for (const p in value) {
    if (descriptors[p].writable) value[p] = serifyNode(value[p], options);
  }
  return value;
};

export const serify = (value, options) =>
  serifyNode(value, mergeOptions(options));

export const createReduxMiddleware = (options) => () => (next) => (action) => {
  action.payload = serify(action.payload, options);
  next(action);
};

const deserifyNode = (value, options = {}) => {
  if (isPrimitive(value)) return value;

  if (isPlainObject(value) && value.serifyKey === options.serifyKey) {
    // eslint-disable-next-line no-prototype-builtins
    if (!value.hasOwnProperty('type') || !value.hasOwnProperty('value'))
      throw new Error(`invalid serified object: ${JSON.stringify(value)}`);

    const serifyType = options.types[value.type];
    if (!serifyType)
      throw new Error(`${value.type} is not a supported serify type`);

    if (typeof serifyType.deserifier !== 'function')
      throw new Error(`invalid ${value.type} deserifier`);

    return serifyType.deserifier(deserifyNode(value.value, options));
  }

  for (const p in value) value[p] = deserifyNode(value[p], options);

  return value;
};

export const deserify = (value, options) =>
  deserifyNode(value, mergeOptions(options));
