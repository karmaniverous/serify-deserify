import { afterEach, describe, expect, it } from 'vitest';

import { isContainer, mapContainer } from './mapContainer';

const double = (v: unknown) => (typeof v === 'number' ? v * 2 : v);

describe('isContainer', () => {
  it.each([
    ['an array', [], true],
    ['a plain object', {}, true],
    ['a null-prototype object', Object.create(null) as object, false],
    ['a Map', new Map(), false],
    ['a Date', new Date(0), false],
    [
      'a class instance',
      new (class Thing {
        readonly id = 1;
      })(),
      false,
    ],
    ['a primitive', 'text', false],
    ['null', null, false],
  ])('recognises %s', (_, value, expected) => {
    expect(isContainer(value)).toBe(expected);
  });
});

describe('mapContainer', () => {
  afterEach(() => {
    delete (Object.prototype as Record<string, unknown>).polluted;
  });

  it('maps array elements into a new array without mutating the input', () => {
    const input = [1, 'two', 3];

    const output = mapContainer(input, double);

    expect(output).toStrictEqual([2, 'two', 6]);
    expect(output).not.toBe(input);
    expect(input).toStrictEqual([1, 'two', 3]);
  });

  it('maps property values into a new plain object without mutating the input', () => {
    const input = { a: 1, b: 'two' };

    const output = mapContainer(input, double);

    expect(output).toStrictEqual({ a: 2, b: 'two' });
    expect(output).not.toBe(input);
    expect(input).toStrictEqual({ a: 1, b: 'two' });
  });

  it('keeps a __proto__ key as data rather than setting the prototype', () => {
    const input = JSON.parse('{"__proto__":{"a":1}}') as Record<
      string,
      unknown
    >;

    const output = mapContainer(input, (v) => v);

    expect(Object.getPrototypeOf(output)).toBe(Object.prototype);
    expect(Object.entries(output)).toStrictEqual([['__proto__', { a: 1 }]]);
  });

  it('omits inherited and non-enumerable properties', () => {
    Object.defineProperty(Object.prototype, 'polluted', {
      value: 1,
      enumerable: true,
      configurable: true,
      writable: true,
    });
    const input = { a: 1 };
    Object.defineProperty(input, 'hidden', { value: 2, enumerable: false });

    expect(Object.keys(mapContainer(input, double))).toStrictEqual(['a']);
  });
});
