import {
  combineReducers,
  configureStore,
  createSlice,
  type MiddlewareAPI,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createReduxMiddleware, defaultOptions, serify } from '../';
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

// Dispatch a value into the Redux store and retrieve its serified form.
const bounceValue = (v: unknown) => {
  store.dispatch(setValue(v));

  const {
    test: { value },
  } = store.getState();

  return value;
};

describe('redux', () => {
  beforeEach(() => {
    store.dispatch(setValue(null));
  });

  describe('serializable', () => {
    it('null', () => {
      const v = null;

      const s = bounceValue(v);

      expect(s).toBe(serify(v, customOptions));
    });

    it('bool', () => {
      const v = true;

      const s = bounceValue(v);

      expect(s).toBe(serify(v, customOptions));
    });

    it('number', () => {
      const v = 42;

      const s = bounceValue(v);

      expect(s).toBe(serify(v, customOptions));
    });

    it('string', () => {
      const v = 'tanstaafl';

      const s = bounceValue(v);

      expect(s).toBe(serify(v, customOptions));
    });

    it('object', () => {
      const v = { a: 1, b: 2, c: 3 };

      const s = bounceValue(v);

      expect(s).toStrictEqual(serify(v, customOptions));
    });

    it('array', () => {
      const v = [true, 42, 'tanstaafl'];

      const s = bounceValue(v);

      expect(s).toStrictEqual(serify(v, customOptions));
    });

    it('complex', () => {
      const v = [
        true,
        42,
        'tanstaafl',
        { a: 1, b: 2, c: 3, d: [false, -42, '!tanstaafl'] },
      ];

      const s = bounceValue(v);

      expect(s).toStrictEqual(serify(v, customOptions));
    });
  });

  describe('unserializable', () => {
    it('bigint', () => {
      const v = 1234567890123456789012345678901234567890n;

      const s = bounceValue(v);

      expect(s).toStrictEqual(serify(v, customOptions));
    });

    it('date', () => {
      const v = new Date('2000-01-02T03:04:05.678Z');

      const s = bounceValue(v);

      expect(s).toStrictEqual(serify(v, customOptions));
    });

    it('map', () => {
      const v = new Map<unknown, unknown>([
        ['a', 1],
        [2, 'b'],
        ['c', 3],
      ]);

      const s = bounceValue(v);

      expect(s).toStrictEqual(serify(v, customOptions));
    });

    it('set', () => {
      const v = new Set(['a', 2, 'c']);

      const s = bounceValue(v);

      expect(s).toStrictEqual(serify(v, customOptions));
    });

    it('undefined', () => {
      const v = undefined;

      const s = bounceValue(v);

      expect(s).toStrictEqual(serify(v, customOptions));
    });

    it('complex', () => {
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

      expect(s).toStrictEqual(serify(v, customOptions));
    });

    it('custom', () => {
      const v = new Custom(42n);

      const s = bounceValue(v);

      expect(s).toStrictEqual(serify(v, customOptions));
    });
  });
});

describe('createReduxMiddleware', () => {
  it('passes non-object actions through untouched', () => {
    const api: MiddlewareAPI = { dispatch: vi.fn(), getState: vi.fn() };
    const next = vi.fn();

    createReduxMiddleware(defaultOptions)(api)(next)(42n);

    expect(next).toHaveBeenCalledExactlyOnceWith(42n);
  });

  it('serifies the payload of object actions', () => {
    const api: MiddlewareAPI = { dispatch: vi.fn(), getState: vi.fn() };
    const next = vi.fn();

    createReduxMiddleware(defaultOptions)(api)(next)({
      type: 'test',
      payload: 42n,
    });

    expect(next).toHaveBeenCalledExactlyOnceWith({
      type: 'test',
      payload: serify(42n, defaultOptions),
    });
  });
});
