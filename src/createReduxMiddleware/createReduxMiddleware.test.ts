import {
  combineReducers,
  configureStore,
  createSlice,
  type MiddlewareAPI,
  type PayloadAction,
} from '@reduxjs/toolkit';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';

import { createReduxMiddleware, defaultOptions, deserify, serify } from '../';
import { Custom, customOptions } from '../test/Custom';
import { complexValue } from '../test/fixtures';

/** Build a Redux Toolkit store with the serify middleware installed. */
const createStore = () => {
  const slice = createSlice({
    name: 'test',
    initialState: { value: null as unknown },
    reducers: {
      setValue: (state, { payload }: PayloadAction<unknown>) => {
        state.value = payload;
      },
    },
  });

  const store = configureStore({
    reducer: combineReducers({ test: slice.reducer }),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(createReduxMiddleware(customOptions)),
  });

  /** Dispatch a value & return what landed in the store. */
  return (v: unknown): unknown => {
    store.dispatch(slice.actions.setValue(v));
    return store.getState().test.value;
  };
};

describe('createReduxMiddleware', () => {
  describe('in a Redux Toolkit store', () => {
    let bounce: ReturnType<typeof createStore>;
    let consoleError: MockInstance<typeof console.error>;

    beforeEach(() => {
      bounce = createStore();
      consoleError = vi.spyOn(console, 'error');
    });

    afterEach(() => {
      consoleError.mockRestore();
    });

    it.each([
      ['a primitive', 'tanstaafl'],
      ['a plain structure', [true, 42, { a: 1, d: [false, '!tanstaafl'] }]],
      ['a BigInt', 1234567890123456789012345678901234567890n],
      ['a Date', new Date('2000-01-02T03:04:05.678Z')],
      ['Infinity', Infinity],
      ['undefined', undefined],
      ['a nested structure of default types', complexValue()],
      ['a custom type', new Custom(42n)],
    ])(
      'stores %s in serializable form that deserifies to the original',
      (_, v) => {
        const stored = bounce(v);

        expect(JSON.parse(JSON.stringify(stored))).toStrictEqual(stored);
        expect(deserify(stored, customOptions)).toStrictEqual(v);
        // Redux Toolkit's serializability check reports via console.error.
        expect(consoleError).not.toHaveBeenCalled();
      },
    );

    it('returns the dispatched action from dispatch', () => {
      const slice = createSlice({
        name: 'r',
        initialState: null,
        reducers: { ping: () => null },
      });
      const store = configureStore({
        reducer: slice.reducer,
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat(createReduxMiddleware(defaultOptions)),
      });
      const action = slice.actions.ping();

      expect(store.dispatch(action)).toBe(action);
    });

    it('throws on dispatch of a type missing from the options', () => {
      class Unknown {
        readonly id = 1;
      }

      expect(() => bounce(new Unknown())).toThrow('unserifiable type: Unknown');
    });
  });

  describe('in isolation', () => {
    const api: MiddlewareAPI = { dispatch: vi.fn(), getState: vi.fn() };

    it('passes non-object actions through untouched', () => {
      const next = vi.fn();

      createReduxMiddleware(defaultOptions)(api)(next)(42n);

      expect(next).toHaveBeenCalledExactlyOnceWith(42n);
    });

    it('returns the result of next', () => {
      const next = vi.fn().mockReturnValue('dispatched');

      const result: unknown = createReduxMiddleware(defaultOptions)(api)(next)({
        type: 'test',
      });

      expect(result).toBe('dispatched');
    });

    it('serifies the payload of object actions in place', () => {
      const next = vi.fn();
      const action = { type: 'test', payload: 42n };

      createReduxMiddleware(defaultOptions)(api)(next)(action);

      expect(next).toHaveBeenCalledExactlyOnceWith(action);
      expect(action.payload).toStrictEqual(serify(42n, defaultOptions));
    });
  });
});
