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

`serify` solves this problem by encoding those values (or structures containing
them) into values that `JSON.stringify` _can_ serialize without throwing an
exception. After these values are retrieved and deserialized with `JSON.parse`,
`deserify` returns them to their original state.

## Usage

To install the package, run this command:

```bash
npm install @karmaniverous/serify-deserify
```

Review the unit tests for simple examples of how to use
[`serify`](https://github.com/karmaniverous/serify-deserify/blob/main/lib/serify/serify.test.js)
and
[`deserify`](https://github.com/karmaniverous/serify-deserify/blob/main/lib/deserify/deserify.test.js).

[Click here](https://github.com/karmaniverous/serify-deserify/blob/main/example/redux.js)
for a fully worked out example using the Redux middleware.

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
[default options](https://github.com/karmaniverous/serify-deserify/blob/main/lib/options/defaultOptions.js)
pattern.

## serifyKey

Consider the highly unlikely event that some data you retrieve from your Redux
store contains objects with exactly this form that were _not_ produced by
`serify`:

```
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

[Click here](https://github.com/karmaniverous/serify-deserify/blob/main/example/redux.js)
for a fully worked out example using the Redux middleware.
