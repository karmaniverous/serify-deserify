import { afterEach, describe, expect, it } from 'vitest';

import { defaultOptions, deserify, serify } from '../';
import { Custom, customOptions } from '../test/Custom';
import { CustomFoo, customFooOptions } from '../test/CustomFoo';
import { complexSerified, complexValue } from '../test/fixtures';

describe('deserify', () => {
  describe('serializable values', () => {
    it.each([
      ['null', null],
      ['a boolean', true],
      ['a number', 42],
      ['a string', 'tanstaafl'],
    ])('returns %s unchanged', (_, v) => {
      expect(deserify(v, defaultOptions)).toBe(v);
    });

    it.each([
      ['an object', { a: 1, b: 2, c: 3 }],
      ['an array', [true, 42, 'tanstaafl']],
      [
        'a nested structure',
        [true, 42, 'tanstaafl', { a: 1, d: [false, -42, '!tanstaafl'] }],
      ],
    ])('returns an equal clone of %s', (_, v) => {
      const d = deserify(v, defaultOptions);

      expect(d).toStrictEqual(v);
      expect(d).not.toBe(v);
    });
  });

  describe('default types', () => {
    it.each([
      [
        'BigInt',
        '1234567890123456789012345678901234567890',
        1234567890123456789012345678901234567890n,
      ],
      ['Date', 946782245678, new Date('2000-01-02T03:04:05.678Z')],
      [
        'Map',
        [
          ['a', 1],
          [2, 'b'],
        ],
        new Map<unknown, unknown>([
          ['a', 1],
          [2, 'b'],
        ]),
      ],
      ['Set', ['a', 2], new Set(['a', 2])],
      ['Undefined', null, undefined],
      ['Number', 'NaN', NaN],
      ['Number', 'Infinity', Infinity],
      ['Number', '-Infinity', -Infinity],
      ['Number', '-0', -0],
    ])('restores a %s', (type, value, expected) => {
      expect(
        deserify({ serifyKey: null, type, value }, defaultOptions),
      ).toStrictEqual(expected);
    });

    it('restores a null-prototype object and deserifies its contents', () => {
      const d = deserify(
        {
          serifyKey: null,
          type: 'NullObject',
          value: { p: { serifyKey: null, type: 'BigInt', value: '42' } },
        },
        defaultOptions,
      );

      expect(Object.getPrototypeOf(d)).toBeNull();
      expect({ ...(d as object) }).toStrictEqual({ p: 42n });
    });

    it('deserifies nested serified values recursively', () => {
      expect(deserify(complexSerified, defaultOptions)).toStrictEqual(
        complexValue(),
      );
    });

    it('does not mutate its input', () => {
      const v = structuredClone(complexSerified);

      deserify(v, defaultOptions);

      expect(v).toStrictEqual(complexSerified);
    });

    it.each([NaN, Infinity, -Infinity, -0, 0, 1.5])(
      'round-trips the number %s exactly through JSON',
      (v) => {
        const json = JSON.stringify(serify(v, defaultOptions));

        expect(
          Object.is(deserify(JSON.parse(json) as unknown, defaultOptions), v),
        ).toBe(true);
      },
    );

    it('reverses serify after a JSON round trip', () => {
      const json = JSON.stringify(serify(complexValue(), defaultOptions));

      expect(
        deserify(JSON.parse(json) as unknown, defaultOptions),
      ).toStrictEqual(complexValue());
    });
  });

  describe('custom types', () => {
    it('restores a class identified by its constructor name', () => {
      const d = deserify(
        {
          serifyKey: null,
          type: 'Custom',
          value: { serifyKey: null, type: 'BigInt', value: '42' },
        },
        customOptions,
      );

      expect(d).toStrictEqual(new Custom(42n));
    });

    it('restores a class identified by its static type property', () => {
      const d = deserify(
        {
          serifyKey: null,
          type: 'Foo',
          value: { serifyKey: null, type: 'BigInt', value: '42' },
        },
        customFooOptions,
      );

      expect(d).toStrictEqual(new CustomFoo(42n));
    });
  });

  describe('values that are not serified values', () => {
    it.each([
      ['a mismatched serifyKey', { serifyKey: 42, type: 'Custom', value: 1 }],
      ['an unsupported type', { serifyKey: null, type: 'CustomFoo', value: 1 }],
      ['a non-string type', { serifyKey: null, type: 7, value: 1 }],
      ['a missing value key', { serifyKey: null, type: 'Custom' }],
      ['a missing serifyKey', { type: 'Custom', value: 1 }],
    ])('treats an object with %s as a plain object', (_, v) => {
      expect(deserify(v, customOptions)).toStrictEqual(v);
    });

    it('still deserifies the contents of an unrecognised object', () => {
      const d = deserify(
        {
          serifyKey: 42,
          type: 'Custom',
          value: { serifyKey: null, type: 'BigInt', value: '42' },
        },
        customOptions,
      );

      expect(d).toStrictEqual({ serifyKey: 42, type: 'Custom', value: 42n });
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
