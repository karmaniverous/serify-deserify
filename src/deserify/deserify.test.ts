import { inspect } from 'node:util';

import { afterEach, describe, expect, it } from 'vitest';

import { defaultOptions, deserify, serify } from '../';
import { customOptions } from '../test/Custom';
import { CustomFoo, customFooOptions } from '../test/CustomFoo';

describe('deserify', () => {
  describe('serializable', () => {
    it('null', () => {
      const v = null;

      const d = deserify(v, defaultOptions);

      expect(d).toBe(v);
    });

    it('bool', () => {
      const v = true;

      const d = deserify(v, defaultOptions);

      expect(d).toBe(v);
    });

    it('number', () => {
      const v = 42;

      const d = deserify(v, defaultOptions);

      expect(d).toBe(v);
    });

    it('string', () => {
      const v = 'tanstaafl';

      const d = deserify(v, defaultOptions);

      expect(d).toBe(v);
    });

    it('object', () => {
      const v = { a: 1, b: 2, c: 3 };

      const d = deserify(v, defaultOptions);

      expect(d).toStrictEqual(v);
      expect(typeof (d as Record<string, unknown>).constructor).not.toBe(
        undefined,
      );
    });

    it('array', () => {
      const v = [true, 42, 'tanstaafl'];

      const d = deserify(v, defaultOptions);

      expect(d).toStrictEqual(v);
    });

    it('complex', () => {
      const v = [
        true,
        42,
        'tanstaafl',
        { a: 1, b: 2, c: 3, d: [false, -42, '!tanstaafl'] },
      ];

      const d = deserify(v, defaultOptions);

      expect(d).toStrictEqual(v);
    });
  });

  describe('unserializable', () => {
    it('bigint', () => {
      const v = {
        serifyKey: null,
        type: 'BigInt',
        value: '1234567890123456789012345678901234567890',
      };

      const d = deserify(v, defaultOptions);

      expect(inspect(d, false, null)).toBe(
        '1234567890123456789012345678901234567890n',
      );
    });

    it('date', () => {
      const v = { serifyKey: null, type: 'Date', value: 946753445678 };

      const d = deserify(v, defaultOptions);

      expect(inspect(d, false, null)).toBe('2000-01-01T19:04:05.678Z');
    });

    it('map', () => {
      const v = {
        serifyKey: null,
        type: 'Map',
        value: [
          ['a', 1],
          [2, 'b'],
          ['c', 3],
        ],
      };

      const d = deserify(v, defaultOptions);

      expect(inspect(d, false, null)).toBe(
        `Map(3) { 'a' => 1, 2 => 'b', 'c' => 3 }`,
      );
    });

    it('set', () => {
      const v = {
        serifyKey: null,
        type: 'Set',
        value: ['a', 2, 'c'],
      };

      const d = deserify(v, defaultOptions);

      expect(inspect(d, false, null)).toBe(`Set(3) { 'a', 2, 'c' }`);
    });

    it('undefined', () => {
      const v = {
        serifyKey: null,
        type: 'Undefined',
        value: null,
      };

      const d = deserify(v, defaultOptions);

      expect(d).toBe(undefined);
    });

    it('complex', () => {
      const v = {
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
            { serifyKey: null, type: 'Date', value: 946753445678 },
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
      };

      const d = deserify(v, defaultOptions);

      // console.log(inspect(d, false, null));

      expect(inspect(d, false, null)).toBe(
        `Map(2) {
  1234567890123456789012345678901234567890n => [ Map(3) { 'a' => 1, 2 => 'b', 'c' => 3 }, Set(3) { 'a', 2, 'c' } ],
  2000-01-01T19:04:05.678Z => [
    Set(3) { 'd', 5, 'f' },
    Map(3) { 'd' => 4, 5 => 'e', 'f' => undefined }
  ]
}`,
      );
    });

    it('null object', () => {
      const v = {
        serifyKey: null,
        type: 'NullObject',
        value: { p: { serifyKey: null, type: 'BigInt', value: '42' } },
      };

      const d = deserify(v, defaultOptions);

      expect(d).toStrictEqual(Object.assign(Object.create(null), { p: 42n }));
      expect((d as Record<string, unknown>).constructor).toBe(undefined);
    });

    it('custom', () => {
      const v = {
        serifyKey: null,
        type: 'Custom',
        value: { serifyKey: null, type: 'BigInt', value: '42' },
      };

      const d = deserify(v, customOptions);

      expect(inspect(d, false, null)).toBe(`Custom { p: 42n }`);
    });

    it('unmatched serifyKey', () => {
      const v = {
        serifyKey: 42,
        type: 'Custom',
        value: { serifyKey: null, type: 'BigInt', value: '42' },
      };

      const d = deserify(v, customOptions);

      expect(d).toStrictEqual({
        serifyKey: 42,
        type: 'Custom',
        value: 42n,
      });
    });

    it('unsupported type', () => {
      const v = { serifyKey: null, type: 'CustomFoo', value: 42 };

      const d = deserify(v, customOptions);

      expect(d).toStrictEqual(v);
    });

    it('custom with key', () => {
      const v = {
        serifyKey: null,
        type: 'Foo',
        value: { serifyKey: null, type: 'BigInt', value: '42' },
      };

      const d = deserify(v, customFooOptions);

      expect(d).toStrictEqual(new CustomFoo(42n));
    });
  });

  describe('errors', () => {
    it('throws on a value that is not composed of serializable types', () => {
      expect(() => deserify(new Date(0), defaultOptions)).toThrow(
        'Value is not deserifiable: "1970-01-01T00:00:00.000Z"',
      );
    });
  });

  describe('object keys', () => {
    afterEach(() => {
      // Clean up below polluted test
      delete (Object.prototype as Record<string, unknown>).polluted;
    });

    it('restores a custom __proto__ key on a plain object without setting its prototype', () => {
      const v = JSON.parse(
        '{"label":"first","__proto__":{"weight":10}}',
      ) as unknown;

      const d = deserify(v, defaultOptions) as object;

      expect(Object.entries(d)).toStrictEqual([
        ['label', 'first'],
        ['__proto__', { weight: 10 }],
      ]);
      expect((d as Record<string, unknown>).weight).toBe(undefined);
    });

    it('restores a custom __proto__ key on a null object without setting its prototype', () => {
      const v = JSON.parse(
        '{"serifyKey":null,"type":"NullObject","value":{"enabled":true,"__proto__":{"depth":4}}}',
      ) as unknown;

      const d = deserify(v, defaultOptions) as object;

      expect(Object.entries(d)).toStrictEqual([
        ['enabled', true],
        ['__proto__', { depth: 4 }],
      ]);
      expect((d as Record<string, unknown>).depth).toBe(undefined);
    });

    it('excludes enumerable keys inherited from Object.prototype', () => {
      Object.defineProperty(Object.prototype, 'polluted', {
        value: 'polluted value',
        enumerable: true,
        configurable: true,
        writable: true,
      });

      const d = deserify({ total: 12 }, defaultOptions);

      expect(Object.keys(d as object)).toStrictEqual(['total']);
    });
  });

  describe('round trip', () => {
    it('preserves a custom __proto__ key and the standard prototype on a plain object', () => {
      const v = {};
      Object.defineProperty(v, 'city', { value: 'Perth', enumerable: true });
      Object.defineProperty(v, '__proto__', {
        value: { postcode: '6000' },
        enumerable: true,
      });

      const d = deserify(
        JSON.parse(JSON.stringify(serify(v, defaultOptions))),
        defaultOptions,
      ) as object;

      expect(Object.getPrototypeOf(d)).toBe(Object.prototype);
      expect(Object.entries(d)).toStrictEqual([
        ['city', 'Perth'],
        ['__proto__', { postcode: '6000' }],
      ]);
    });

    it('preserves a custom __proto__ key and the null prototype on a null object', () => {
      const v = Object.create(null) as object;
      Object.defineProperty(v, 'year', { value: 2026, enumerable: true });
      Object.defineProperty(v, '__proto__', {
        value: { month: 'October' },
        enumerable: true,
      });

      const d = deserify(
        JSON.parse(JSON.stringify(serify(v, defaultOptions))),
        defaultOptions,
      ) as object;

      expect(Object.getPrototypeOf(d)).toBe(null);
      expect(Object.entries(d)).toStrictEqual([
        ['year', 2026],
        ['__proto__', { month: 'October' }],
      ]);
    });

    it('preserves a custom constructor key and the standard prototype on a plain object', () => {
      const v = JSON.parse('{"constructor":"bicycle","wheels":2}') as unknown;

      const d = deserify(
        JSON.parse(JSON.stringify(serify(v, defaultOptions))),
        defaultOptions,
      ) as object;

      expect(Object.getPrototypeOf(d)).toBe(Object.prototype);
      expect(Object.entries(d)).toStrictEqual([
        ['constructor', 'bicycle'],
        ['wheels', 2],
      ]);
    });

    it('preserves a custom constructor key and the null prototype on a null object', () => {
      const v = Object.create(null) as object;
      Object.defineProperty(v, 'constructor', {
        value: 'kettle',
        enumerable: true,
      });
      Object.defineProperty(v, 'litres', { value: 1.5, enumerable: true });

      const d = deserify(
        JSON.parse(JSON.stringify(serify(v, defaultOptions))),
        defaultOptions,
      ) as object;

      expect(Object.getPrototypeOf(d)).toBe(null);
      expect(Object.entries(d)).toStrictEqual([
        ['constructor', 'kettle'],
        ['litres', 1.5],
      ]);
    });
  });
});
