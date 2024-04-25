/* eslint-env mocha */

import { expect } from 'chai';

import { defaultOptions, serify } from '../';
import { Custom, customOptions } from '../test/Custom';
import { CustomFoo, customFooOptions } from '../test/CustomFoo';

describe('serify', function () {
  describe('serializable', function () {
    it('null', function () {
      const v = null;

      const s = serify(v, defaultOptions);

      expect(s).to.equal(v);
    });

    it('bool', function () {
      const v = true;

      const s = serify(v, defaultOptions);

      expect(s).to.equal(v);
    });

    it('number', function () {
      const v = 42;

      const s = serify(v, defaultOptions);

      expect(s).to.equal(v);
    });

    it('string', function () {
      const v = 'tanstaafl';

      const s = serify(v, defaultOptions);

      expect(s).to.equal(v);
    });

    it('object', function () {
      const v = { a: 1, b: 2, c: 3 };

      const s = serify(v, defaultOptions);

      expect(s).to.deep.equal(v);
    });

    it('frozen property', function () {
      const v = { a: 1, b: 2, c: { a: 1, b: 2, c: 3 } };
      Object.freeze(v.c);

      const s = serify(v, defaultOptions);

      expect(s).to.deep.equal(v);
    });

    it('unwritable property', function () {
      const v = { a: 1, b: 2, c: 3 };

      Object.defineProperty(v, 'd', {
        value: [1, 2, 3],
        writable: false,
      });

      const s = serify(v, defaultOptions);

      expect(s).to.deep.equal(v);
    });

    it('array', function () {
      const v = [true, 42, 'tanstaafl'];

      const s = serify(v, defaultOptions);

      expect(s).to.deep.equal(v);
    });

    it('complex', function () {
      const v = [
        true,
        42,
        'tanstaafl',
        { a: 1, b: 2, c: 3, d: [false, -42, '!tanstaafl'] },
      ];

      const s = serify(v, defaultOptions);

      expect(s).to.deep.equal(v);
    });
  });

  describe('unserializable', function () {
    it('bigint', function () {
      const v = 1234567890123456789012345678901234567890n;

      const s = serify(v, defaultOptions);

      expect(s).to.deep.equal({
        serifyKey: null,
        type: 'BigInt',
        value: '1234567890123456789012345678901234567890',
      });
    });

    it('date', function () {
      const v = new Date('2000-01-02T03:04:05.678Z');

      const s = serify(v, defaultOptions);

      expect(s).to.deep.equal({
        serifyKey: null,
        type: 'Date',
        value: 946782245678,
      });
    });

    it('map', function () {
      const v = new Map<unknown, unknown>([
        ['a', 1],
        [2, 'b'],
        ['c', 3],
      ]);

      const s = serify(v, defaultOptions);

      expect(s).to.deep.equal({
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

      const s = serify(v, defaultOptions);

      expect(s).to.deep.equal({
        serifyKey: null,
        type: 'Set',
        value: ['a', 2, 'c'],
      });
    });

    it('undefined', function () {
      const v = undefined;

      const s = serify(v, defaultOptions);

      expect(s).to.deep.equal({
        serifyKey: null,
        type: 'Undefined',
        value: null,
      });
    });

    it('complex', function () {
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

      expect(s).to.deep.equal({
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

    it('custom', function () {
      const v = new Custom(42);

      const s = serify(v, customOptions);

      expect(s).to.deep.equal({ serifyKey: null, type: 'Custom', value: 42 });
    });

    it('custom with key', function () {
      const v = new CustomFoo(42);

      const s = serify(v, customFooOptions);

      expect(s).to.deep.equal({ serifyKey: null, type: 'Foo', value: 42 });
    });
  });

  describe('errors', function () {
    it('invalid serifier', function () {
      const v = new Custom(42);

      expect(() => serify(v, defaultOptions)).to.throw(
        Error,
        'unserifiable type: Custom',
      );
    });
  });
});
