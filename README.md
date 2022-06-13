**serify** - reversibly transform an unserializable value into a serializable
one

**deserify** - do the exact opposite

## Why?

`JSON.stringify` and `JSON.parse` are a notoriously bad serializer/deserializer
combination. They don't support important Javascript types like `BigInt`,
`Date`, `Map`, and `Set`. Thanks to backward compatibility risk, they probably
never will.

There are tons of custom serializers that address this issue, notably
[`serialize-javascript`](https://www.npmjs.com/package/serialize-javascript) and
[`serializr`](https://www.npmjs.com/package/serializr). Unfortunately, some key
Javascript tools like [Redux](https://redux.js.org) explicitly depend on
`JSON.stringify` & `JSON.parse`. So if you use Redux, none of those fancy
serializers will help you get a `Date` or a `BigInt` into your store and back
out again in one piece.

`serify` solves this problem by encoding those objects (or ones containing them)
into ones that `JSON.stringify` can serialize without throwing an exception.
After these objects are retrieved and deserialized with `JSON.parse`, `deserify`
returns them to their original state.

## Usage

To install the package, run this command:

```bash
npm install @karmaniverous/serify-deserify
```

A simple example:

```javascript
import { serify, deserify } from '@karmaniverous/serify-deserify';

/* SERIFY */

// Let's store a BigInt in the Redux store.
const unserializable = 42n; // Redux will choke on this!

// What does this object look like?
console.log(unserializable.constructor.name); // BigInt
console.log(unserializable); // 42n

// Try sending it to the store.
dispatch(setValue(unserializable)); // FAILS!

// Serify the value before storing.
// Use an options param for custom types.
const serializable = serify(unserializable);

// What does it look like now?
console.log(serializable.constructor.name); // Object
console.log(serializable); // { serifyKey: null, type: "BigInt", value: "42" }

// Send the serified value to the store.
dispatch(setValue(serializable)); // SUCCEEDS!

/* DESERIFY */

// Retrieve the value from Redux.
const { value } = deserify(useSelector((state) => state.slice));

// Of course the retrieved object looks just like the one you stored.
console.log(value.constructor.name); // Object
console.log(value); // { serifyKey: null, type: "BigInt", value: "42" }

// Now deserify the value.
// Use an options param for custom types.
const deserified = deserify(value);

// What did we get?
console.log(deserified.constructor.name); // BigInt
console.log(deserified); // 42n
```

Review the [unit tests](/src/index.test.mjs) for more examples of how to use
`serify` and `deserify`.

## Serifiable Types

`serify` and `deserify` will work on values of any serifiable type.

A _serifiable type_ is any type that is:

- reversibly supported by `JSON.stringify` and `JSON.parse`, i.e. booleans,
  numbers, strings, plain objects, and arrays
- natively supported by `serify`, i.e. `BigInt`, `Date`, `Map`, and `Set`
- added to `serify` as a custom type
- composed exclusively of any of the above, i.e. arrays of BigInt-keyed Maps of
  objects containing Sets of custom class instances

To create a new serifiable type or to modify the behavior or an existing one,
just pass in an `options` object that follows the
[default options](/src/options.mjs) pattern.

## serifyKey

Consider the highly unlikely event that some data you retrieve from your Redux
store contains objects with exactly this form that were _not_ produced by
`serify`:

```javascript
{
  serifyKey: null,
  type: <string>,
  value: <any>
}
```

`deserify` will attempt to deserify this object and your process will fail. In
this case, simply add a non-null `serifyKey` of a serifiable primitive type
(meaning a boolean, number, or string) to your `options` object and everything
will work again.

## Redux

The `createReduxMiddleware` function generates a Redux middleware that will
serify every value pushed to your Redux store. If you use
[Redux Toolkit](https://redux-toolkit.js.org/), leave the default
`serializeCheck` middleware in place and it will notify you if you need to add a
new type to your serify options!

When retrieving values from the Redux store, either deserify them explicitly or
wrap your selectors in the `deserify` function.

`createReduxMiddleware` will work anyplace Redux is used, but
[we're all supposed to be using Redux Toolkit now](https://redux-toolkit.js.org/introduction/getting-started#purpose).
So here's an example using Redux Toolkit:

```javascript
// Let's create a custom class to send to our Redux store.
class Custom {
  constructor(p) {
    this.p = p;
  }
}

// Here's a serify options object that supports the new class.
const serifyOptions = {
  types: {
    Custom: {
      serifier: (u) => u.p,
      deserifier: (s) => new Custom(s),
    },
  },
};

// Generate a serify Redux middleware.
import { createReduxMiddleware, deserify } from '../src/index.mjs';
const serifyMiddleware = createReduxMiddleware(serifyOptions);

// Import Redux Toolkit.
import { combineReducers, configureStore, createSlice } from '@reduxjs/toolkit';

// Construct a Redux slice.
const testSlice = createSlice({
  name: 'test',
  initialState: { value: null },
  reducers: {
    setValue: (state, { payload }) => {
      state.value = payload;
    },
  },
});

// Configure your Redux store.
const store = configureStore({
  reducer: combineReducers({
    test: testSlice.reducer,
  }),
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware(),
    // Add the serify middleware last, or Redux Toolkit's serializableCheck
    // will reject values before they are serified!
    serifyMiddleware,
  ],
});

// Get redux functions.
const { setValue } = testSlice.actions;
const { dispatch, getState } = store;

/* LET'S TRY IT OUT... */

// Let's store a BigInt in the Redux store.
const unserializable = 42n; // Normally Redux would choke on this!

// Try sending it to the store.
dispatch(setValue(unserializable)); // SUCCEEDS!

// Retrieve the value the store.
const {
  test: { value },
} = getState();

// The retrieved object is still serified.
console.log(value.constructor.name); // Object
console.log(value); // { serifyKey: null, type: "BigInt", value: "42" }

// You could wrap a selector in deserify, but for now we'll just deserify
// the value explicitly.
const deserified = deserify(value);

// What did we get?
console.log(deserified.constructor.name); // BigInt
console.log(deserified); // 42n
```
