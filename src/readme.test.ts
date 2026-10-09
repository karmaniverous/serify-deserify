/**
 * Executable README: each test mirrors a README example and asserts the
 * results the README documents. Keep the two in sync.
 */
import {
  combineReducers,
  configureStore,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { describe, expect, it } from 'vitest';

import {
  createReduxMiddleware,
  defaultOptions,
  type DefaultTypeMap,
  deserify,
  serify,
  type SerifyOptions,
  serifyStaticTypeProperty,
} from './';

describe('README', () => {
  it('Usage', () => {
    const value = 42n;

    const serified = serify(value, defaultOptions);
    expect(serified).toStrictEqual({
      serifyKey: null,
      type: 'BigInt',
      value: '42',
    });

    expect(deserify(serified, defaultOptions)).toBe(42n);
  });

  it('Serifiable Types: caveats', () => {
    const v = { a: 1 };
    Object.defineProperty(v, 'hidden', { value: 1, enumerable: false });
    Object.defineProperty(v, Symbol('s'), { value: 1, enumerable: true });

    expect(JSON.stringify(serify(v, defaultOptions))).toBe('{"a":1}');
  });

  it('serifyKey', () => {
    const data = { serifyKey: null, type: 'Date', value: 'Bar' };

    const d = deserify(data, defaultOptions);
    expect(d).toBeInstanceOf(Date);
    expect(Number.isNaN((d as Date).getTime())).toBe(true);

    const keyedOptions = { ...defaultOptions, serifyKey: 'my-serify-key' };
    expect(deserify(data, keyedOptions)).toStrictEqual(data);

    const unconfigured = { serifyKey: null, type: 'Foo', value: 'Bar' };
    expect(deserify(unconfigured, defaultOptions)).toStrictEqual(unconfigured);
  });

  it('Default Configuration', () => {
    const nullObject = Object.assign(Object.create(null) as object, { a: 1 });

    expect(
      serify(
        [
          12n,
          new Date(5),
          new Map([['k', 'v']]),
          new Set([1]),
          undefined,
          nullObject,
          -Infinity,
        ],
        defaultOptions,
      ),
    ).toStrictEqual([
      { serifyKey: null, type: 'BigInt', value: '12' },
      { serifyKey: null, type: 'Date', value: 5 },
      { serifyKey: null, type: 'Map', value: [['k', 'v']] },
      { serifyKey: null, type: 'Set', value: [1] },
      { serifyKey: null, type: 'Undefined', value: null },
      { serifyKey: null, type: 'NullObject', value: { a: 1 } },
      { serifyKey: null, type: 'Number', value: '-Infinity' },
    ]);
  });

  it('Custom Configuration', () => {
    class Custom {
      constructor(public p: number) {}
    }

    const customOptions: SerifyOptions<
      DefaultTypeMap & { Custom: [Custom, number] }
    > = {
      ...defaultOptions,
      serifyKey: 42,
      types: {
        ...defaultOptions.types,
        Custom: {
          serifier: (value) => value.p,
          deserifier: (value) => new Custom(value),
        },
      },
    };

    const serified = serify(new Custom(42), customOptions);
    expect(serified).toStrictEqual({
      serifyKey: 42,
      type: 'Custom',
      value: 42,
    });

    expect(deserify(serified, customOptions)).toStrictEqual(new Custom(42));
  });

  it('Custom Configuration: type key resolution', () => {
    const constructorless = Object.create(
      Object.create(null) as object,
    ) as object;

    expect(() => serify(constructorless, defaultOptions)).toThrow(
      'unserifiable type: Object',
    );
    expect(() => serify(Symbol('s'), defaultOptions)).toThrow(
      'unserifiable type: Symbol',
    );
    expect(() => serify(() => 1, defaultOptions)).toThrow(
      'unserifiable type: Function',
    );
  });

  it('Static Type Property & TypeScript', () => {
    class CustomFoo {
      static [serifyStaticTypeProperty] = 'Foo';

      constructor(public p: number) {}
    }

    interface CustomFooTypeMap extends DefaultTypeMap {
      Foo: [CustomFoo, number];
    }

    const customOptions: SerifyOptions<CustomFooTypeMap> = {
      ...defaultOptions,
      serifyKey: 42,
      types: {
        ...defaultOptions.types,
        Foo: {
          serifier: (value) => value.p,
          deserifier: (value) => new CustomFoo(value),
        },
      },
    };

    const serified = serify(new CustomFoo(42), customOptions);
    expect(serified).toStrictEqual({ serifyKey: 42, type: 'Foo', value: 42 });

    expect(deserify(serified, customOptions)).toStrictEqual(new CustomFoo(42));
  });

  it('Recursion: deserifier receives deserified contents', () => {
    const received: unknown[] = [];
    const spyOptions: SerifyOptions<DefaultTypeMap> = {
      ...defaultOptions,
      types: {
        ...defaultOptions.types,
        Map: {
          serifier: (value) => defaultOptions.types.Map.serifier(value),
          deserifier: (value) => {
            received.push(value);
            return new Map(value);
          },
        },
      },
    };

    deserify(serify(new Map([[1n, 2n]]), defaultOptions), spyOptions);

    expect(received).toStrictEqual([[[1n, 2n]]]);
  });

  it('Redux', () => {
    const serifyMiddleware = createReduxMiddleware(defaultOptions);

    const testSlice = createSlice({
      name: 'test',
      initialState: { value: null as unknown },
      reducers: {
        setValue: (state, { payload }: PayloadAction<unknown>) => {
          state.value = payload;
        },
      },
    });

    const store = configureStore({
      reducer: combineReducers({
        test: testSlice.reducer,
      }),
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(serifyMiddleware),
    });

    const action = testSlice.actions.setValue(42n);
    store.dispatch(action);

    expect(deserify(store.getState().test.value, defaultOptions)).toBe(42n);
    expect(action.payload).toStrictEqual(serify(42n, defaultOptions));

    class Unconfigured {
      readonly id = 1;
    }
    expect(() =>
      store.dispatch(testSlice.actions.setValue(new Unconfigured())),
    ).toThrow('unserifiable type: Unconfigured');
  });

  it('Immutability', () => {
    const input = { m: new Map([['a', [1n]]]) };

    const serified = serify(input, defaultOptions);
    expect(input.m.get('a')).toStrictEqual([1n]);

    const frozen = structuredClone(serified);
    deserify(serified, defaultOptions);
    expect(serified).toStrictEqual(frozen);
  });

  it('Errors', () => {
    expect(() => serify(Symbol('s'), defaultOptions)).toThrow(
      'unserifiable type: Symbol',
    );
    expect(() => deserify(new Date(0), defaultOptions)).toThrow(
      'Value is not deserifiable: "1970-01-01T00:00:00.000Z"',
    );
  });
});
