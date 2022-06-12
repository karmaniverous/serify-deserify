**serify** - reversibly transform an unserializable value into a serializable one

**deserify** - do the exact opposite

## Why?

`JSON.stringify` is a notoriously bad serializer. It doesn't support important Javascript types like `BigInt`, `Date`, `Map`, and `Set`. Thanks to backward compatibility risk, it probably never will.

There are tons of custom serializers that address this issue, notably [serialize-javascript](https://www.npmjs.com/package/serialize-javascript). Unfortunately, some key tools like [Redux](https://redux.js.org) explicitly depend on JSON.stringify. So if you use Redux, none of those fancy serializers will help you get a Date or a BigInt into your store.

## Usage

To install, run this command:

```bash
npm install serify-deserify
```

A simple example:

```javascript
import { serify, deserify } from 'serify-deserify';

// Try storing a Date in your Redux store.
const unserializable = new Date(); // Redux will choke on this!
console.log(unserializable.constructor.name); // Date
dispatch(setValue(unserializable)); // FAILS!

// Serify the value before storing.
const serializable = serify(unserializable); // Use an options param for custom types.
console.log(unserializable.constructor.name); // Object
dispatch(setValue(unserializable)); // SUCCEEDS!

// Retrieve the value from Redux.
const retrieved = deserify(useSelector(state => state.slice)
console.log(unserializable.constructor.name); // Object

// Deserify the value.
const deserified = deserify(retrieved); // Use an options param for custom types.
console.log(deserified.constructor.name); // Date
```

Review the [unit tests](/src/index.test.mjs) for extensive examples of how to use `serify` and `deserify`.

## Serifiable Types

A _serifiable type_ is any type that is:

* supported by `JSON.stringify`, i.e. primitive types, plain objects, and arrays
* natively supported by `serify`, i.e. `BigInt`, `Date`, `Map`, and `Set`
* added to `serify` as a custom type
* composed exclusively of any of the above, i.e. arrays of BigInt-keyed Maps of Sets of custom class instances

To create a new serifiable type or to modify the behavior or an existing one, just pass in an `options` object that follows the [default options](/src/options.mjs) pattern.

## serifyKey

Consider the highly unlikely event that your data contains objects with exactly this form:

```
{
  serifyKey: null,
  type: <string>,
  value: <any>
}
```

`deserify` will attempt to deserify this object and your process will fail. In this case, simply add a unique, non-null `serifyKey` to your `options` object and everything will work again.
