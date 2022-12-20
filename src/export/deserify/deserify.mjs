import { isArray, isPlainObject, isPrimitive } from 'is-what';

import { mergeOptions } from '../options/mergeOptions.mjs';

import '../options/types.mjs';

/**
 * deserify a node
 *
 * @private
 * @function deserifyNode
 *
 * @param {*} [value] - node to be deserified
 * @param  {Options} [options] - options object
 *
 * @returns {*} deserified node
 */
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

  let copy;
  if (isArray(value)) copy = [...value];
  if (isPlainObject(value)) copy = { ...value };
  for (const p in copy) copy[p] = deserifyNode(copy[p], options);

  return copy ?? value;
};

/**
 * deserify a value
 *
 * @function deserify
 *
 * @param {*} [value] - value to be deserified
 * @param  {Options} [options] - options object
 *
 * @returns {*} deserified value
 */
export const deserify = (value, options) =>
  deserifyNode(value, mergeOptions(options));
