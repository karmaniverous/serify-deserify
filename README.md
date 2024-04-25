**serify** - reversibly transform an unserializable value into a serializable one

**deserify** - do the exact opposite

> <font color="darkRed">**BREAKING CHANGE:** The v2.0.0 release is a complete TypeScript refactor. The API now requires you to import & extend the [`defaultOptions`](./src/options/defaultOptions.ts) object to create custom types. See the [Options section](#options) for more info!</font>

## Why?

`JSON.stringify` and `JSON.parse` are a notoriously bad serializer/deserializer combination. They don't support important Javascript types like `BigInt`, `Date`, `Map`, `Set`, and `unknown`. Thanks to backward compatibility risk, they probably never will.

There are tons of custom serializers that address this issue, notably [`serialize-javascript`](https://www.npmjs.com/package/serialize-javascript) and [`serializr`](https://www.npmjs.com/package/serializr). Unfortunately, some key Javascript tools like [Redux](https://redux.js.org) explicitly depend on `JSON.stringify` & `JSON.parse`. So if you use Redux, none of those fancy serializers will help you get a `Date` or a `BigInt` into your store and back out again in one piece.

`serify` solves this problem by encoding those values (or structures containing them) into values that `JSON.stringify` _can_ serialize without throwing an exception. After these values are retrieved and deserialized with `JSON.parse`, `deserify` returns them to their original state.

## Usage

To install the package, run this command:

```bash
npm install @karmaniverous/serify-deserify
```

Review the unit tests for simple examples of how to use [`serify`](./src/serify/serify.test.ts) and [`deserify`](./src/deserify/deserify.test.ts).

See the [`createReduxMiddleware` unit tests](./src/createReduxMiddleware/createReduxMiddleware.test.ts) for a fully worked out example of how to configure & integrate the Redux middleware.

## Serifiable Types

`serify` and `deserify` will work on values of any serifiable type.

A _serifiable type_ is any type that is:

- reversibly supported by `JSON.stringify` and `JSON.parse`, i.e. booleans, numbers, strings, plain objects, and arrays.
- natively supported by `serify`, i.e. `BigInt`, `Date`, `Map`, `Set`, and `unknown`.
- added to `serify` as a custom type.
- composed exclusively of any of the above (e.g. an array of BigInt-keyed Maps of objects containing Sets of custom class instances).

## serifyKey

`serify` works by converting unserializable values into structured objects that ARE serializable.

Consider the highly unlikely event that some data you want to `deserify` contains objects with exactly this form that were _not_ produced by `serify`:

```
{
  serifyKey: null,
  type: 'Foo',
  value: 'Bar'
}
```

If you are using the [default configuration](./src/options/defaultOptions.ts) (which does not support a `Foo` type), `deserify` will attempt to deserify this object and your process will either fail or produce an incorrect result.

In this case, simply add a non-null `serifyKey` of a serifiable primitive type (meaning a `boolean`, `number`, or `string`) to your `options` object, and everything will work again.

## Options

[Serifiable types](#serifiable-types) and the [`serifyKey`](#serifykey) are defined in an `options` object, which specifies the logic that converts each type to and from a serializable form.

### Default Configuration

Out of the box, the [`defaultOptions`](./src/options/defaultOptions.ts) object supports the `BigInt`, `Date`, `Map`, `Set`, and `unknown` types.

If you only need the default configuration, simply import the `defaultOptions` object and pass it to `serify` and `deserify`:

```js
import {
  serify,
  deserify,
  defaultOptions,
} from '@karmaniverous/serify-deserify';

// A BigInt test value.
const bigAnswer = 42n;

const serified = serify(value, defaultOptions);
// { serifyKey: null, type: 'BigInt', value: '42' }

const deserified = deserify(serified, defaultOptions);
// 42n
```

### Custom Configuration

If you need to change the `serifyKey` or add custom types, you can create a new `options` object and pass it to `serify` and `deserify`.

For a custom class that doesn't use a [Static Type Property](#static-type-property), the key of the related `serify` type is its class name. For anything else, the logic that determines the key is [here](https://github.com/karmaniverous/serify-deserify/blob/cbf92286f255eac2b5fa2e651f1d5e26a638e737/src/serify/serify.ts#L24-L29).

```js
import { serify, deserify, defaultOptions } from '@karmaniverous/serify-deserify';

// A custom class.
export class Custom {
  public p;

  constructor(p) {
    this.p = p;
  }
}

// A serify options object including support for the new custom type.
const customOptions = {
  ...defaultOptions
  serifyKey: 42,
  types: {
    ...defaultOptions.types,
    Custom: {
      serifier: (value) => value.p,
      deserifier: (value) => new Custom(value)
    }
  }
}

// A Custom test value.
const customAnswer = new Custom(42);

const serified = serify(customAnswer, customOptions);
// { serifyKey: 42, type: 'Custom', value: 42 }

const deserified = deserify(serified, customOptions);
// Custom { p: 42 }
```

### Static Type Property

Normally, a type's key in the serify options object is the type's class name. If a class is dynamically generated, this value may not be known at compile time, so it would not be possible to configure it into the options object in a static manner.

One option is to alter the options object at runtime. _Go nuts!_

Another is to import the `serifyStaticTypeProperty` symbol to create a static property on your class. Use that as type key in your options object.

```js
import {
  serify,
  deserify,
  defaultOptions,
  serifyStaticTypeProperty
} from '@karmaniverous/serify-deserify';

// A custom class.
export class CustomFoo {
  static [serifyStaticTypeProperty] = 'Foo';
  public p;

  constructor(p) {
    this.p = p;
  }
}

// A serify options object including support for the new custom type.
const customOptions = {
  ...defaultOptions
  serifyKey: 42,
  types: {
    ...defaultOptions.types,
    Foo: {
      serifier: (value) => value.p,
      deserifier: (value) => new CustomFoo(value)
    }
  }
}

// A Custom test value.
const customAnswer = new CustomFoo(42);

const serified = serify(customAnswer, customOptions);
// { serifyKey: 42, type: 'Foo', value: 42 }

const deserified = deserify(serified, customOptions);
// CustomFoo { p: 42 }
```

### Typescript

`serify-deserify` is fully type-safe. If you are using TypeScript, you can define your custom types and options objects with full type checking.

This is accomplished by defining a special _type map_ interface that maps a type's name to its types before and after serification. See [`defaultOptions.ts`](./src/options/defaultOptions.ts) to review the default configuration as an example.

Here's the last example again, but with TypeScript:

```ts
import {
  serify,
  deserify,
  defaultOptions,
  serifyStaticTypeProperty,
  type SerifiableTypeMap,
  type SerifyOptions
} from '@karmaniverous/serify-deserify';

// A custom class.
export class CustomFoo {
  static [serifyStaticTypeProperty] = 'Foo';

  constructor(public p: number) {}
}

// Extend the default type map to include your new type.
// The tuple indicates the type before and after serification.
interface FooTypeMap extends SerifiableTypeMap {
  Custom: [CustomFoo, number]
}

// A serify options object including support for the new custom type.
const customOptions: SerifyOptions<CustomFooTypeMap> = {
  ...defaultOptions
  serifyKey: 42,
  types: {
    ...defaultOptions.types,
    Foo: {
      serifier: (value) => value.p,
      deserifier: (value) => new CustomFoo(value)
    }
  }
}

// A Custom test value.
const customAnswer = new CustomFoo(42);

const serified = serify(customAnswer, customOptions);
// { serifyKey: 42, type: 'Foo', value: 42 }

const deserified = deserify(serified, customOptions);
// CustomFoo { p: 42 }
```

## Redux

The `createReduxMiddleware` function generates a Redux middleware that will
serify every value pushed to your Redux store. If you use
[Redux Toolkit](https://redux-toolkit.js.org/), leave the default
`serializeCheck` middleware in place and it will notify you if you need to add a
new type to your serify options!

When retrieving values from the Redux store, either deserify them explicitly or
wrap your selectors in the `deserify` function.

See the [`createReduxMiddleware` unit tests](./src/createReduxMiddleware/createReduxMiddleware.test.ts) for a fully worked out example.

---

See more great templates and other tools on
[my GitHub Profile](https://github.com/karmaniverous)!
