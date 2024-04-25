/* eslint-env mocha */

import {
  combineReducers,
  configureStore,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { expect } from 'chai';

import { createReduxMiddleware, serify } from '../';
import { Custom, customOptions } from '../test/Custom';

// Create state type.
interface TestState {
  value: unknown;
}

// Set initial state.
const initialState: TestState = {
  value: null,
};

// Construct slice.
const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    setValue: (state, { payload }: PayloadAction<TestState['value']>) => {
      state.value = payload;
    },
  },
});

// Create middleware.
const serifyMiddleware = createReduxMiddleware(customOptions);

// Configure redux store.
const store = configureStore({
  reducer: combineReducers({
    test: testSlice.reducer,
  }),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(serifyMiddleware),
});

// Get redux functions.
const { setValue } = testSlice.actions;
// eslint-disable-next-line @typescript-eslint/unbound-method
const { dispatch, getState } = store;

// Dispatch a value into the Redux store and retrieve its serified form.
const bounceValue = (v: unknown) => {
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
    it('null', function () {
      const v = null;

      const s = bounceValue(v);

      expect(s).to.equal(serify(v, customOptions));
    });

    it('bool', function () {
      const v = true;

      const s = bounceValue(v);

      expect(s).to.equal(serify(v, customOptions));
    });

    it('number', function () {
      const v = 42;

      const s = bounceValue(v);

      expect(s).to.equal(serify(v, customOptions));
    });

    it('string', function () {
      const v = 'tanstaafl';

      const s = bounceValue(v);

      expect(s).to.equal(serify(v, customOptions));
    });

    it('object', function () {
      const v = { a: 1, b: 2, c: 3 };

      const s = bounceValue(v);

      expect(s).to.deep.equal(serify(v, customOptions));
    });

    it('array', function () {
      const v = [true, 42, 'tanstaafl'];

      const s = bounceValue(v);

      expect(s).to.deep.equal(serify(v, customOptions));
    });

    it('complex', function () {
      const v = [
        true,
        42,
        'tanstaafl',
        { a: 1, b: 2, c: 3, d: [false, -42, '!tanstaafl'] },
      ];

      const s = bounceValue(v);

      expect(s).to.deep.equal(serify(v, customOptions));
    });
  });

  describe('unserializable', function () {
    it('bigint', function () {
      const v = 1234567890123456789012345678901234567890n;

      const s = bounceValue(v);

      expect(s).to.deep.equal(serify(v, customOptions));
    });

    it('date', function () {
      const v = new Date('2000-01-02T03:04:05.678Z');

      const s = bounceValue(v);

      expect(s).to.deep.equal(serify(v, customOptions));
    });

    it('map', function () {
      const v = new Map<unknown, unknown>([
        ['a', 1],
        [2, 'b'],
        ['c', 3],
      ]);

      const s = bounceValue(v);

      expect(s).to.deep.equal(serify(v, customOptions));
    });

    it('set', function () {
      const v = new Set(['a', 2, 'c']);

      const s = bounceValue(v);

      expect(s).to.deep.equal(serify(v, customOptions));
    });

    it('undefined', function () {
      const v = undefined;

      const s = bounceValue(v);

      expect(s).to.deep.equal(serify(v, customOptions));
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
          new Date('2000-01-02 03:04:05.678'),
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

      const s = bounceValue(v);

      expect(s).to.deep.equal(serify(v, customOptions));
    });

    it('custom', function () {
      const v = new Custom(42);

      const s = bounceValue(v);

      expect(s).to.deep.equal(serify(v, customOptions));
    });
  });
});
