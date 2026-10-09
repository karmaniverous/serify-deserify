import { afterEach, describe, expect, it } from 'vitest';

import { defaultOptions, serify, type SerifyOptions } from '../';
import { Custom, customOptions } from '../test/Custom';
import { CustomFoo, customFooOptions } from '../test/CustomFoo';
import { complexSerified, complexValue } from '../test/fixtures';

/** Options supporting only `BigInt`: no `Number`, `Custom`, etc. */
const bigIntOnlyOptions: SerifyOptions<{ BigInt: [bigint, string] }> = {
  serifyKey: null,
  types: { BigInt: defaultOptions.types.BigInt },
};

describe('serify', () => {
  describe('serializable values', () => {
    it.each([
      ['null', null],
      ['a boolean', true],
      ['a number', 42],
      ['a string', 'tanstaafl'],
    ])('returns %s unchanged', (_, v) => {
      expect(serify(v, defaultOptions)).toBe(v);
    });

    it.each([
      ['an object', { a: 1, b: 2, c: 3 }],
      ['an array', [true, 42, 'tanstaafl']],
      [
        'a nested structure',
        [true, 42, 'tanstaafl', { a: 1, d: [false, -42, '!tanstaafl'] }],
      ],
    ])('returns an equal clone of %s', (_, v) => {
      const s = serify(v, defaultOptions);

      expect(s).toStrictEqual(v);
      expect(s).not.toBe(v);
    });

    it('does not mutate a frozen input', () => {
      const v = Object.freeze({ a: 1, c: Object.freeze({ d: 2n }) });

      const s = serify(v, defaultOptions);

      expect(s).toStrictEqual({
        a: 1,
        c: { d: { serifyKey: null, type: 'BigInt', value: '2' } },
      });
      expect(v.c.d).toBe(2n);
    });

    it('omits non-enumerable properties', () => {
      const v = { a: 1 };
      Object.defineProperty(v, 'd', { value: [1, 2, 3], writable: false });

      expect(serify(v, defaultOptions)).toStrictEqual({ a: 1 });
    });
  });

  describe('default types', () => {
    it.each([
      [
        'BigInt',
        1234567890123456789012345678901234567890n,
        '1234567890123456789012345678901234567890',
      ],
      ['Date', new Date('2000-01-02T03:04:05.678Z'), 946782245678],
      [
        'Map',
        new Map<unknown, unknown>([
          ['a', 1],
          [2, 'b'],
        ]),
        [
          ['a', 1],
          [2, 'b'],
        ],
      ],
      ['Set', new Set(['a', 2]), ['a', 2]],
      ['Undefined', undefined, null],
      ['Number (NaN)', NaN, 'NaN'],
      ['Number (Infinity)', Infinity, 'Infinity'],
      ['Number (-Infinity)', -Infinity, '-Infinity'],
      ['Number (-0)', -0, '-0'],
    ])('wraps a %s', (label, v, value) => {
      const type = label.split(' ')[0];

      expect(serify(v, defaultOptions)).toStrictEqual({
        serifyKey: null,
        type,
        value,
      });
    });

    it('wraps a null-prototype object and serifies its contents', () => {
      const v = Object.assign(Object.create(null) as object, { p: 42n });

      expect(serify(v, defaultOptions)).toStrictEqual({
        serifyKey: null,
        type: 'NullObject',
        value: { p: { serifyKey: null, type: 'BigInt', value: '42' } },
      });
    });

    it('serifies nested unserializable values recursively', () => {
      expect(serify(complexValue(), defaultOptions)).toStrictEqual(
        complexSerified,
      );
    });

    it('writes the configured serifyKey', () => {
      expect(serify(42n, { ...defaultOptions, serifyKey: 'k' })).toStrictEqual({
        serifyKey: 'k',
        type: 'BigInt',
        value: '42',
      });
    });
  });

  describe('custom types', () => {
    it('identifies a class by its constructor name', () => {
      expect(serify(new Custom(42n), customOptions)).toStrictEqual({
        serifyKey: null,
        type: 'Custom',
        value: { serifyKey: null, type: 'BigInt', value: '42' },
      });
    });

    it('identifies a class by its static type property', () => {
      expect(serify(new CustomFoo(42n), customFooOptions)).toStrictEqual({
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

  describe('type identification', () => {
    it('ignores an own constructor property holding a function', () => {
      const v = { constructor: Date, hour: 9 };

      expect(() => serify(v, defaultOptions)).toThrow(
        'unserifiable type: Function',
      );
    });
  });

  describe('errors', () => {
    it.each([
      ['a class instance with no configured type', new Custom(42n), 'Custom'],
      ['a symbol', Symbol('s'), 'Symbol'],
      ['a non-JSON number with no Number type configured', Infinity, 'Number'],
      ['a function', () => 1, 'Function'],
      [
        'an object whose prototype chain has no constructor',
        Object.create(Object.create(null) as object) as object,
        'Object',
      ],
    ])('throws on %s', (_, v, type) => {
      expect(() => serify(v, bigIntOnlyOptions)).toThrow(
        `unserifiable type: ${type}`,
      );
    });

    it('throws on an unserifiable value nested in a container', () => {
      expect(() => serify({ a: [new Custom(1n)] }, defaultOptions)).toThrow(
        'unserifiable type: Custom',
      );
    });
  });
});
