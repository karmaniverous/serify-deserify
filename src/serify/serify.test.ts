import { afterEach, describe, expect, it } from 'vitest';

import { defaultOptions, serify } from '../';
import { Custom, customOptions } from '../test/Custom';
import { CustomFoo, customFooOptions } from '../test/CustomFoo';

describe('serify', () => {
  describe('serializable', () => {
    it('null', () => {
      const v = null;

      const s = serify(v, defaultOptions);

      expect(s).toBe(v);
    });

    it('bool', () => {
      const v = true;

      const s = serify(v, defaultOptions);

      expect(s).toBe(v);
    });

    it('number', () => {
      const v = 42;

      const s = serify(v, defaultOptions);

      expect(s).toBe(v);
    });

    it('string', () => {
      const v = 'tanstaafl';

      const s = serify(v, defaultOptions);

      expect(s).toBe(v);
    });

    it('object', () => {
      const v = { a: 1, b: 2, c: 3 };

      const s = serify(v, defaultOptions);

      expect(s).toStrictEqual(v);
    });

    it('frozen property', () => {
      const v = { a: 1, b: 2, c: { a: 1, b: 2, c: 3 } };
      Object.freeze(v.c);

      const s = serify(v, defaultOptions);

      expect(s).toStrictEqual(v);
    });

    it('unwritable property', () => {
      const v = { a: 1, b: 2, c: 3 };

      Object.defineProperty(v, 'd', {
        value: [1, 2, 3],
        writable: false,
      });

      const s = serify(v, defaultOptions);

      expect(s).toStrictEqual(v);
    });

    it('array', () => {
      const v = [true, 42, 'tanstaafl'];

      const s = serify(v, defaultOptions);

      expect(s).toStrictEqual(v);
    });

    it('complex', () => {
      const v = [
        true,
        42,
        'tanstaafl',
        { a: 1, b: 2, c: 3, d: [false, -42, '!tanstaafl'] },
      ];

      const s = serify(v, defaultOptions);

      expect(s).toStrictEqual(v);
    });
  });

  describe('unserializable', () => {
    it('bigint', () => {
      const v = 1234567890123456789012345678901234567890n;

      const s = serify(v, defaultOptions);

      expect(s).toStrictEqual({
        serifyKey: null,
        type: 'BigInt',
        value: '1234567890123456789012345678901234567890',
      });
    });

    it('date', () => {
      const v = new Date('2000-01-02T03:04:05.678Z');

      const s = serify(v, defaultOptions);

      expect(s).toStrictEqual({
        serifyKey: null,
        type: 'Date',
        value: 946782245678,
      });
    });

    it('map', () => {
      const v = new Map<unknown, unknown>([
        ['a', 1],
        [2, 'b'],
        ['c', 3],
      ]);

      const s = serify(v, defaultOptions);

      expect(s).toStrictEqual({
        serifyKey: null,
        type: 'Map',
        value: [
          ['a', 1],
          [2, 'b'],
          ['c', 3],
        ],
      });
    });

    it('set', () => {
      const v = new Set(['a', 2, 'c']);

      const s = serify(v, defaultOptions);

      expect(s).toStrictEqual({
        serifyKey: null,
        type: 'Set',
        value: ['a', 2, 'c'],
      });
    });

    it('undefined', () => {
      const v = undefined;

      const s = serify(v, defaultOptions);

      expect(s).toStrictEqual({
        serifyKey: null,
        type: 'Undefined',
        value: null,
      });
    });

    it('complex', () => {
      const v = new Map<unknown, unknown>([
        [
          1234567890123456789012345678901234567890n,
          [
            new Map<unknown, unknown>([
              ['a', 1],
              [2, 'b'],
              ['c', 3],
            ]),
            new Set(['a', 2, 'c']),
          ],
        ],
        [
          new Date('2000-01-02T03:04:05.678Z'),
          [
            new Set(['d', 5, 'f']),
            new Map<unknown, unknown>([
              ['d', 4],
              [5, 'e'],
              ['f', undefined],
            ]),
          ],
        ],
      ]);

      const s = serify(v, defaultOptions);

      expect(s).toStrictEqual({
        serifyKey: null,
        type: 'Map',
        value: [
          [
            {
              serifyKey: null,
              type: 'BigInt',
              value: '1234567890123456789012345678901234567890',
            },
            [
              {
                serifyKey: null,
                type: 'Map',
                value: [
                  ['a', 1],
                  [2, 'b'],
                  ['c', 3],
                ],
              },
              { serifyKey: null, type: 'Set', value: ['a', 2, 'c'] },
            ],
          ],
          [
            { serifyKey: null, type: 'Date', value: 946782245678 },
            [
              { serifyKey: null, type: 'Set', value: ['d', 5, 'f'] },
              {
                serifyKey: null,
                type: 'Map',
                value: [
                  ['d', 4],
                  [5, 'e'],
                  ['f', { serifyKey: null, type: 'Undefined', value: null }],
                ],
              },
            ],
          ],
        ],
      });
    });

    it('null object', () => {
      const v = Object.create(null) as Record<string, unknown>;
      v.p = 42n;

      const s = serify(v, defaultOptions);

      expect(s).toStrictEqual({
        serifyKey: null,
        type: 'NullObject',
        value: { p: { serifyKey: null, type: 'BigInt', value: '42' } },
      });
    });

    it('custom', () => {
      const v = new Custom(42n);

      const s = serify(v, customOptions);

      expect(s).toStrictEqual({
        serifyKey: null,
        type: 'Custom',
        value: { serifyKey: null, type: 'BigInt', value: '42' },
      });
    });

    it('custom with key', () => {
      const v = new CustomFoo(42n);

      const s = serify(v, customFooOptions);

      expect(s).toStrictEqual({
        serifyKey: null,
        type: 'Foo',
        value: { serifyKey: null, type: 'BigInt', value: '42' },
      });
    });
  });

  describe('object keys', () => {
    afterEach(() => {
      // Clean up below polluted test
      delete (Object.prototype as Record<string, unknown>).polluted;
    });

    it('preserves a custom __proto__ key on a plain object', () => {
      const v = {};
      Object.defineProperty(v, 'name', { value: 'plain', enumerable: true });
      Object.defineProperty(v, '__proto__', {
        value: { colour: 'red' },
        enumerable: true,
      });

      const s = serify(v, defaultOptions);

      expect(JSON.stringify(s)).toBe(
        '{"name":"plain","__proto__":{"colour":"red"}}',
      );
    });

    it('preserves a custom __proto__ key on a null object', () => {
      const v = Object.create(null) as object;
      Object.defineProperty(v, 'count', { value: 3, enumerable: true });
      Object.defineProperty(v, '__proto__', {
        value: { size: 'large' },
        enumerable: true,
      });

      const s = serify(v, defaultOptions);

      expect(JSON.stringify(s)).toBe(
        '{"serifyKey":null,"type":"NullObject","value":{"count":3,"__proto__":{"size":"large"}}}',
      );
    });

    it('does not overwrite the output prototype from a custom __proto__ key', () => {
      const v = JSON.parse('{"__proto__":{"shape":"circle"}}') as object;

      const s = serify(v, defaultOptions);

      expect(Object.getPrototypeOf(s)).toBe(Object.prototype);
    });

    it('excludes enumerable keys inherited from Object.prototype', () => {
      Object.defineProperty(Object.prototype, 'polluted', {
        value: 'polluted value',
        enumerable: true,
        configurable: true,
        writable: true,
      });

      const s = serify({ id: 7 }, defaultOptions);

      expect(Object.keys(s as object)).toStrictEqual(['id']);
    });

    it('preserves a custom constructor key holding a string on a plain object', () => {
      const v = JSON.parse('{"constructor":"widget","price":5}') as unknown;

      const s = serify(v, defaultOptions);

      expect(JSON.stringify(s)).toBe('{"constructor":"widget","price":5}');
    });

    it('preserves a custom constructor key holding a string on a null object', () => {
      const v = Object.create(null) as object;
      Object.defineProperty(v, 'constructor', {
        value: 'gadget',
        enumerable: true,
      });
      Object.defineProperty(v, 'stock', { value: 8, enumerable: true });

      const s = serify(v, defaultOptions);

      expect(JSON.stringify(s)).toBe(
        '{"serifyKey":null,"type":"NullObject","value":{"constructor":"gadget","stock":8}}',
      );
    });

    it('does not choose the serifier from a custom constructor key', () => {
      const v = JSON.parse(
        '{"constructor":{"name":"Date"},"hour":9}',
      ) as unknown;

      const s = serify(v, defaultOptions);

      expect(JSON.stringify(s)).toBe(
        '{"constructor":{"name":"Date"},"hour":9}',
      );
    });
  });

  describe('errors', () => {
    it('invalid serifier', () => {
      const v = new Custom(42n);

      expect(() => serify(v, defaultOptions)).toThrow(
        'unserifiable type: Custom',
      );
    });

    it('reports an unserifiable type for an object whose prototype chain has no constructor', () => {
      const v = Object.create(Object.create(null) as object) as object;
      Object.defineProperty(v, 'colour', { value: 'teal', enumerable: true });

      expect(() => serify(v, defaultOptions)).toThrow(
        'unserifiable type: Object',
      );
    });
  });
});
