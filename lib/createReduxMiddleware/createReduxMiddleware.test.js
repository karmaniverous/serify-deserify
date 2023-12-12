/* eslint-env mocha */

import chai from 'chai';
const should = chai.should();

class Custom {
  constructor(p) {
    this.p = p;
  }
}

const serifyOptions = {
  types: {
    Custom: {
      serifier: (u) => u.p,
      deserifier: (s) => new Custom(s),
    },
  },
};

import { createReduxMiddleware } from './createReduxMiddleware.js';

const serifyMiddleware = createReduxMiddleware(serifyOptions);

import * as toolkitRaw from '@reduxjs/toolkit';
const { combineReducers, configureStore, createSlice } =
  toolkitRaw.default ?? toolkitRaw;

// Construct Redux slice.
const testSlice = createSlice({
  name: 'test',
  initialState: { value: null },
  reducers: {
    setValue: (state, { payload }) => {
      state.value = payload;
    },
  },
});

// Configure redux store.
const store = configureStore({
  reducer: combineReducers({
    test: testSlice.reducer,
  }),
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware(),
    // Add the serify middleware last, or Redux Toolkit's serializableCheck will
    // reject values before they are serified!
    serifyMiddleware,
  ],
});

// Get redux functions.
const { setValue } = testSlice.actions;
const { dispatch, getState } = store;

const storeValue = (v) => {
  dispatch(setValue(v));
  const {
    test: { value },
  } = getState();
  return value;
};

describe('redux', function () {
  beforeEach(function () {
    dispatch(setValue(null));
  });

  describe('serializable', function () {
    it('undefined', function () {
      const v = undefined;

      const s = storeValue(v);

      should.equal(s, v);
    });

    it('null', function () {
      const v = null;

      const s = storeValue(v);

      should.equal(s, v);
    });

    it('bool', function () {
      const v = true;

      const s = storeValue(v);

      s.should.equal(v);
    });

    it('number', function () {
      const v = 42;

      const s = storeValue(v);

      s.should.equal(v);
    });

    it('string', function () {
      const v = 'tanstaafl';

      const s = storeValue(v);

      s.should.equal(v);
    });

    it('object', function () {
      const v = { a: 1, b: 2, c: 3 };

      const s = storeValue(v);

      s.should.deep.equal(v);
    });

    it('array', function () {
      const v = [true, 42, 'tanstaafl'];

      const s = storeValue(v);

      s.should.deep.equal(v);
    });

    it('complex', function () {
      const v = [
        true,
        42,
        'tanstaafl',
        { a: 1, b: 2, c: 3, d: [false, -42, '!tanstaafl'] },
      ];

      const s = storeValue(v);

      s.should.deep.equal(v);
    });
  });

  describe('unserializable', function () {
    it('bigint', function () {
      const v = 1234567890123456789012345678901234567890n;

      const s = storeValue(v);

      s.should.deep.equal({
        serifyKey: null,
        type: 'BigInt',
        value: '1234567890123456789012345678901234567890',
      });
    });

    it('date', function () {
      const v = new Date('2000-01-02T03:04:05.678Z');

      const s = storeValue(v);

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

      const s = storeValue(v);

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

      const s = storeValue(v);

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
          new Date('2000-01-02 03:04:05.678'),
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

      const s = storeValue(v);

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
      });
    });

    it('custom', function () {
      const v = new Custom(42);

      const s = storeValue(v);

      s.should.deep.equal({ serifyKey: null, type: 'Custom', value: 42 });
    });
  });
});
