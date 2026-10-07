/* eslint-env mocha */

import { expect } from 'chai';
import { inspect } from 'util';

import { defaultOptions, deserify, serify } from '../';
import { customOptions } from '../test/Custom';

describe('deserify', function () {
  describe('serializable', function () {
    it('null', function () {
      const v = null;

      const d = deserify(v, defaultOptions);

      expect(d).to.equal(v);
    });

    it('bool', function () {
      const v = true;

      const d = deserify(v, defaultOptions);

      expect(d).to.equal(v);
    });

    it('number', function () {
      const v = 42;

      const d = deserify(v, defaultOptions);

      expect(d).to.equal(v);
    });

    it('string', function () {
      const v = 'tanstaafl';

      const d = deserify(v, defaultOptions);

      expect(d).to.equal(v);
    });

    it('object', function () {
      const v = { a: 1, b: 2, c: 3 };

      const d = deserify(v, defaultOptions);

      expect(d).to.deep.equal(v);
      expect(typeof (d as Record<string, unknown>).constructor).not.to.equal(
        undefined,
      );
    });

    it('array', function () {
      const v = [true, 42, 'tanstaafl'];

      const d = deserify(v, defaultOptions);

      expect(d).to.deep.equal(v);
    });

    it('complex', function () {
      const v = [
        true,
        42,
        'tanstaafl',
        { a: 1, b: 2, c: 3, d: [false, -42, '!tanstaafl'] },
      ];

      const d = deserify(v, defaultOptions);

      expect(d).to.deep.equal(v);
    });
  });

  describe('unserializable', function () {
    it('bigint', function () {
      const v = {
        serifyKey: null,
        type: 'BigInt',
        value: '1234567890123456789012345678901234567890',
      };

      const d = deserify(v, defaultOptions);

      expect(inspect(d, false, null)).to.equal(
        '1234567890123456789012345678901234567890n',
      );
    });

    it('date', function () {
      const v = { serifyKey: null, type: 'Date', value: 946753445678 };

      const d = deserify(v, defaultOptions);

      expect(inspect(d, false, null)).to.equal('2000-01-01T19:04:05.678Z');
    });

    it('map', function () {
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

      expect(inspect(d, false, null)).to.equal(
        `Map(3) { 'a' => 1, 2 => 'b', 'c' => 3 }`,
      );
    });

    it('set', function () {
      const v = {
        serifyKey: null,
        type: 'Set',
        value: ['a', 2, 'c'],
      };

      const d = deserify(v, defaultOptions);

      expect(inspect(d, false, null)).to.equal(`Set(3) { 'a', 2, 'c' }`);
    });

    it('undefined', function () {
      const v = {
        serifyKey: null,
        type: 'Undefined',
        value: null,
      };

      const d = deserify(v, defaultOptions);

      expect(d).to.equal(undefined);
    });

    it('complex', function () {
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

      expect(inspect(d, false, null)).to.equal(
        `Map(2) {
  1234567890123456789012345678901234567890n => [ Map(3) { 'a' => 1, 2 => 'b', 'c' => 3 }, Set(3) { 'a', 2, 'c' } ],
  2000-01-01T19:04:05.678Z => [
    Set(3) { 'd', 5, 'f' },
    Map(3) { 'd' => 4, 5 => 'e', 'f' => undefined }
  ]
}`,
      );
    });

    it('null object', function () {
      const v = {
        serifyKey: null,
        type: 'NullObject',
        value: { p: { serifyKey: null, type: 'BigInt', value: '42' } },
      };

      const d = deserify(v, defaultOptions);

      expect(d).to.deep.equal(Object.assign(Object.create(null), { p: 42n }));
      expect((d as Record<string, unknown>).constructor).to.equal(undefined);
    });

    it('custom', function () {
      const v = {
        serifyKey: null,
        type: 'Custom',
        value: { serifyKey: null, type: 'BigInt', value: '42' },
      };

      const d = deserify(v, customOptions);

      console.log(inspect(d, false, null));

      expect(inspect(d, false, null)).to.equal(`Custom { p: 42n }`);
    });

    it('unmatched serifyKey', function () {
      const v = {
        serifyKey: 42,
        type: 'Custom',
        value: { serifyKey: null, type: 'BigInt', value: '42' },
      };

      const d = deserify(v, customOptions);

      expect(d).to.deep.equal({
        serifyKey: 42,
        type: 'Custom',
        value: 42n,
      });
    });

    it('unsupported type', function () {
      const v = { serifyKey: null, type: 'CustomFoo', value: 42 };

      const d = deserify(v, customOptions);

      expect(d).to.deep.equal(v);
    });
  });

  describe('object keys', function () {
    afterEach(function () {
      // Clean up below polluted test
      delete (Object.prototype as Record<string, unknown>).polluted;
    });

    it('restores a custom __proto__ key on a plain object without setting its prototype', function () {
      const v = JSON.parse(
        '{"label":"first","__proto__":{"weight":10}}',
      ) as unknown;

      const d = deserify(v, defaultOptions) as object;

      expect(Object.entries(d)).to.deep.equal([
        ['label', 'first'],
        ['__proto__', { weight: 10 }],
      ]);
      expect((d as Record<string, unknown>).weight).to.equal(undefined);
    });

    it('restores a custom __proto__ key on a null object without setting its prototype', function () {
      const v = JSON.parse(
        '{"serifyKey":null,"type":"NullObject","value":{"enabled":true,"__proto__":{"depth":4}}}',
      ) as unknown;

      const d = deserify(v, defaultOptions) as object;

      expect(Object.entries(d)).to.deep.equal([
        ['enabled', true],
        ['__proto__', { depth: 4 }],
      ]);
      expect((d as Record<string, unknown>).depth).to.equal(undefined);
    });

    it('excludes enumerable keys inherited from Object.prototype', function () {
      Object.defineProperty(Object.prototype, 'polluted', {
        value: 'polluted value',
        enumerable: true,
        configurable: true,
        writable: true,
      });

      const d = deserify({ total: 12 }, defaultOptions);

      expect(Object.keys(d as object)).to.deep.equal(['total']);
    });
  });

  describe('round trip', function () {
    it('preserves a custom __proto__ key and the standard prototype on a plain object', function () {
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

      expect(Object.getPrototypeOf(d)).to.equal(Object.prototype);
      expect(Object.entries(d)).to.deep.equal([
        ['city', 'Perth'],
        ['__proto__', { postcode: '6000' }],
      ]);
    });

    it('preserves a custom __proto__ key and the null prototype on a null object', function () {
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

      expect(Object.getPrototypeOf(d)).to.equal(null);
      expect(Object.entries(d)).to.deep.equal([
        ['year', 2026],
        ['__proto__', { month: 'October' }],
      ]);
    });

    it('preserves a custom constructor key and the standard prototype on a plain object', function () {
      const v = JSON.parse('{"constructor":"bicycle","wheels":2}') as unknown;

      const d = deserify(
        JSON.parse(JSON.stringify(serify(v, defaultOptions))),
        defaultOptions,
      ) as object;

      expect(Object.getPrototypeOf(d)).to.equal(Object.prototype);
      expect(Object.entries(d)).to.deep.equal([
        ['constructor', 'bicycle'],
        ['wheels', 2],
      ]);
    });

    it('preserves a custom constructor key and the null prototype on a null object', function () {
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

      expect(Object.getPrototypeOf(d)).to.equal(null);
      expect(Object.entries(d)).to.deep.equal([
        ['constructor', 'kettle'],
        ['litres', 1.5],
      ]);
    });
  });
});
