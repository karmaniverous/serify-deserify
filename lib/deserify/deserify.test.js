/* eslint-env mocha */

import { inspect } from 'util';

import chai from 'chai';
const should = chai.should();

import { deserify } from './deserify.js';
import { getCustomOptions } from '../test/Custom.js';

let customOptions;

describe('deserify', function () {
  beforeEach(function () {
    customOptions = getCustomOptions();
  });

  describe('serializable', function () {
    it('undefined', function () {
      const v = undefined;

      const d = deserify(v);

      should.equal(d, v);
    });

    it('null', function () {
      const v = null;

      const d = deserify(v);

      should.equal(d, v);
    });

    it('bool', function () {
      const v = true;

      const d = deserify(v);

      d.should.equal(v);
    });

    it('number', function () {
      const v = 42;

      const d = deserify(v);

      d.should.equal(v);
    });

    it('string', function () {
      const v = 'tanstaafl';

      const d = deserify(v);

      d.should.equal(v);
    });

    it('object', function () {
      const v = { a: 1, b: 2, c: 3 };

      const d = deserify(v);

      d.should.deep.equal(v);
    });

    it('array', function () {
      const v = [true, 42, 'tanstaafl'];

      const d = deserify(v);

      d.should.deep.equal(v);
    });

    it('complex', function () {
      const v = [
        true,
        42,
        'tanstaafl',
        { a: 1, b: 2, c: 3, d: [false, -42, '!tanstaafl'] },
      ];

      const d = deserify(v);

      d.should.deep.equal(v);
    });
  });

  describe('unserializable', function () {
    it('bigint', function () {
      const v = {
        serifyKey: null,
        type: 'BigInt',
        value: '1234567890123456789012345678901234567890',
      };

      const d = deserify(v);

      inspect(d, false, null).should.equal(
        '1234567890123456789012345678901234567890n'
      );
    });

    it('date', function () {
      const v = { serifyKey: null, type: 'Date', value: 946753445678 };

      const d = deserify(v);

      inspect(d, false, null).should.equal('2000-01-01T19:04:05.678Z');
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

      const d = deserify(v);

      inspect(d, false, null).should.equal(
        `Map(3) { 'a' => 1, 2 => 'b', 'c' => 3 }`
      );
    });

    it('set', function () {
      const v = {
        serifyKey: null,
        type: 'Set',
        value: ['a', 2, 'c'],
      };

      const d = deserify(v);

      inspect(d, false, null).should.equal(`Set(3) { 'a', 2, 'c' }`);
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
                  ['f', 6],
                ],
              },
            ],
          ],
        ],
      };

      const d = deserify(v);

      console.log(inspect(d, false, null));

      inspect(d, false, null).should.equal(
        `Map(2) {
  1234567890123456789012345678901234567890n => [ Map(3) { 'a' => 1, 2 => 'b', 'c' => 3 }, Set(3) { 'a', 2, 'c' } ],
  2000-01-01T19:04:05.678Z => [ Set(3) { 'd', 5, 'f' }, Map(3) { 'd' => 4, 5 => 'e', 'f' => 6 } ]
}`
      );
    });

    it('custom', function () {
      const v = { serifyKey: null, type: 'Custom', value: 42 };

      const d = deserify(v, customOptions);

      d.p.should.equal(42);
    });

    it('unmatched serifyKey', function () {
      const v = { serifyKey: 42, type: 'Custom', value: 42 };

      const d = deserify(v, customOptions);

      d.should.deep.equal({ serifyKey: 42, type: 'Custom', value: 42 });
    });
  });

  describe('errors', function () {
    it('invalid serified object', function () {
      const v = { serifyKey: null };

      (() => deserify(v, customOptions)).should.throw(
        Error,
        'invalid serified object'
      );
    });

    it('unsupported type', function () {
      const v = { serifyKey: null, type: 'Unsupported', value: 42 };

      (() => deserify(v, customOptions)).should.throw(
        Error,
        'Unsupported is not a supported serify type'
      );
    });

    it('invalid deserifier', function () {
      customOptions.types.Custom.deserifier = 'tanstaafl';

      const v = { serifyKey: null, type: 'Custom', value: 42 };

      (() => deserify(v, customOptions)).should.throw(
        Error,
        'invalid Custom deserifier'
      );
    });
  });
});
