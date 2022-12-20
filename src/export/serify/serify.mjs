import { isArray, isPlainObject, isPrimitive } from 'is-what';

import { mergeOptions } from '../options/mergeOptions.mjs';

import '../options/types.mjs';

/**
 * serify a node
 *
 * @private
 * @function serifyNode
 *
 * @param {*} [value] - node to be serified
 * @param  {Options} [options] - options object
 *
 * @returns {*} serified node
 */
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

  let copy;
  if (isArray(value)) copy = [...value];
  if (isPlainObject(value)) copy = { ...value };
  for (const p in copy) copy[p] = serifyNode(copy[p], options);

  return copy ?? value;
};

/**
 * serify a value
 *
 * @function serify
 *
 * @param {*} [value] - value to be serified
 * @param  {Options} [options] - options object
 *
 * @returns {*} serified value
 */
export const serify = (value, options) =>
  serifyNode(value, mergeOptions(options));
