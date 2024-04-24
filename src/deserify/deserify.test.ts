/* eslint-env mocha */

import { expect } from 'chai';
import { inspect } from 'util';

import { defaultOptions, type DefaultTypeMap, deserify } from '../';
import { customOptions, type CustomTypeMap } from '../test/Custom';

describe('deserify', function () {
  describe('serializable', function () {
    it('null', function () {
      const v = null;

      const d = deserify<DefaultTypeMap>(v, defaultOptions);

      expect(d).to.equal(v);
    });

    it('bool', function () {
      const v = true;

      const d = deserify<DefaultTypeMap>(v, defaultOptions);

      expect(d).to.equal(v);
    });

    it('number', function () {
      const v = 42;

      const d = deserify<DefaultTypeMap>(v, defaultOptions);

      expect(d).to.equal(v);
    });

    it('string', function () {
      const v = 'tanstaafl';

      const d = deserify<DefaultTypeMap>(v, defaultOptions);

      expect(d).to.equal(v);
    });

    it('object', function () {
      const v = { a: 1, b: 2, c: 3 };

      const d = deserify<DefaultTypeMap>(v, defaultOptions);

      expect(d).to.deep.equal(v);
    });

    it('array', function () {
      const v = [true, 42, 'tanstaafl'];

      const d = deserify<DefaultTypeMap>(v, defaultOptions);

      expect(d).to.deep.equal(v);
    });

    it('complex', function () {
      const v = [
        true,
        42,
        'tanstaafl',
        { a: 1, b: 2, c: 3, d: [false, -42, '!tanstaafl'] },
      ];

      const d = deserify<DefaultTypeMap>(v, defaultOptions);

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

      const d = deserify<DefaultTypeMap>(v, defaultOptions);

      expect(inspect(d, false, null)).to.equal(
        '1234567890123456789012345678901234567890n',
      );
    });

    it('date', function () {
      const v = { serifyKey: null, type: 'Date', value: 946753445678 };

      const d = deserify<DefaultTypeMap>(v, defaultOptions);

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

      const d = deserify<DefaultTypeMap>(v, defaultOptions);

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

      const d = deserify<DefaultTypeMap>(v, defaultOptions);

      expect(inspect(d, false, null)).to.equal(`Set(3) { 'a', 2, 'c' }`);
    });

    it('undefined', function () {
      const v = {
        serifyKey: null,
        type: 'Undefined',
        value: null,
      };

      const d = deserify<DefaultTypeMap>(v, defaultOptions);

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

      const d = deserify<DefaultTypeMap>(v, defaultOptions);

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

    it('custom', function () {
      const v = { serifyKey: null, type: 'Custom', value: 42 };

      const d = deserify<CustomTypeMap>(v, customOptions);

      console.log(inspect(d, false, null));

      expect(inspect(d, false, null)).to.equal(`Custom { p: 42 }`);
    });

    it('unmatched serifyKey', function () {
      const v = { serifyKey: 42, type: 'Custom', value: 42 };

      const d = deserify<CustomTypeMap>(v, customOptions);

      expect(d).to.deep.equal({ serifyKey: 42, type: 'Custom', value: 42 });
    });

    it('unsupported type', function () {
      const v = { serifyKey: null, type: 'CustomFoo', value: 42 };

      const d = deserify<CustomTypeMap>(v, customOptions);

      expect(d).to.deep.equal(v);
    });
  });
});
