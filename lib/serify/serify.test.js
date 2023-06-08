/* eslint-env mocha */

import chai from 'chai';
const should = chai.should();

import { serify } from './serify.js';
import { Custom, getCustomOptions } from '../test/Custom.js';
import {
  CustomWithKey,
  getCustomWithKeyOptions,
} from '../test/CustomWithKey.js';

let customOptions;
let customWithKeyOptions;

describe('serify', function () {
  beforeEach(function () {
    customOptions = getCustomOptions();
    customWithKeyOptions = getCustomWithKeyOptions();
  });

  describe('serializable', function () {
    it('undefined', function () {
      const v = undefined;

      const s = serify(v);

      should.equal(s, v);
    });

    it('null', function () {
      const v = null;

      const s = serify(v);

      should.equal(s, v);
    });

    it('bool', function () {
      const v = true;

      const s = serify(v);

      s.should.equal(v);
    });

    it('number', function () {
      const v = 42;

      const s = serify(v);

      s.should.equal(v);
    });

    it('string', function () {
      const v = 'tanstaafl';

      const s = serify(v);

      s.should.equal(v);
    });

    it('object', function () {
      const v = { a: 1, b: 2, c: 3 };

      const s = serify(v);

      s.should.deep.equal(v);
    });

    it('frozen property', function () {
      const v = { a: 1, b: 2, c: { a: 1, b: 2, c: 3 } };
      Object.freeze(v.c);

      const s = serify(v);

      s.should.deep.equal(v);
    });

    it('unwritable property', function () {
      const v = { a: 1, b: 2, c: 3 };

      Object.defineProperty(v, 'd', {
        value: [1, 2, 3],
        writable: false,
      });

      const s = serify(v);

      s.should.deep.equal(v);
    });

    it('array', function () {
      const v = [true, 42, 'tanstaafl'];

      const s = serify(v);

      s.should.deep.equal(v);
    });

    it('complex', function () {
      const v = [
        true,
        42,
        'tanstaafl',
        { a: 1, b: 2, c: 3, d: [false, -42, '!tanstaafl'] },
      ];

      const s = serify(v);

      s.should.deep.equal(v);
    });
  });

  describe('unserializable', function () {
    it('bigint', function () {
      const v = 1234567890123456789012345678901234567890n;

      const s = serify(v);
      // console.log(s);

      s.should.deep.equal({
        serifyKey: null,
        type: 'BigInt',
        value: '1234567890123456789012345678901234567890',
      });
    });

    it('date', function () {
      const v = new Date('2000-01-02T03:04:05.678Z');

      const s = serify(v);
      // console.log(s);

      s.should.deep.equal({
        serifyKey: null,
        type: 'Date',
        value: 946782245678,
      });
    });

    it('map', function () {
      const v = new Map([
        ['a', 1],
        [2, 'b'],
        ['c', 3],
      ]);

      const s = serify(v);
      // console.log(s);

      s.should.deep.equal({
        serifyKey: null,
        type: 'Map',
        value: [
          ['a', 1],
          [2, 'b'],
          ['c', 3],
        ],
      });
    });

    it('set', function () {
      const v = new Set(['a', 2, 'c']);

      const s = serify(v);
      // console.log(s);

      s.should.deep.equal({
        serifyKey: null,
        type: 'Set',
        value: ['a', 2, 'c'],
      });
    });

    it('complex', function () {
      const v = new Map([
        [
          1234567890123456789012345678901234567890n,
          [
            new Map([
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
            new Map([
              ['d', 4],
              [5, 'e'],
              ['f', 6],
            ]),
          ],
        ],
      ]);

      const s = serify(v);

      s.should.be.deep.equal({
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
                  ['f', 6],
                ],
              },
            ],
          ],
        ],
      });
    });

    it('custom', function () {
      const v = new Custom(42);

      const s = serify(v, customOptions);

      s.should.deep.equal({ serifyKey: null, type: 'Custom', value: 42 });
    });

    it('custom with key', function () {
      const v = new CustomWithKey(42);

      const s = serify(v, customWithKeyOptions);

      s.should.deep.equal({ serifyKey: null, type: 'AlternateKey', value: 42 });
    });
  });

  describe('errors', function () {
    it('invalid serifier', function () {
      customOptions.types.Custom.serifier = 'tanstaafl';

      const v = new Custom(42);

      (() => serify(v, customOptions)).should.throw(
        Error,
        'invalid Custom serifier'
      );
    });
  });
});
