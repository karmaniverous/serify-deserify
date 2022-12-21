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

# API Documentation

## Constants

<dl>
<dt><a href="#PACKAGE_INFO">PACKAGE_INFO</a> : <code><a href="#PackageInfo">PackageInfo</a></code></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#createReduxMiddleware">createReduxMiddleware([options])</a> ⇒ <code>function</code></dt>
<dd><p>create redux middleware</p>
</dd>
<dt><a href="#deserify">deserify([value], [options])</a> ⇒ <code>*</code></dt>
<dd><p>deserify a value</p>
</dd>
<dt><a href="#serify">serify([value], [options])</a> ⇒ <code>*</code></dt>
<dd><p>serify a value</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#serifierCallback">serifierCallback</a> ⇒ <code>*</code></dt>
<dd><p>callback to serify a custom type.</p>
</dd>
<dt><a href="#deserifierCallback">deserifierCallback</a> ⇒ <code>*</code></dt>
<dd><p>callback to deserify a custom type.</p>
</dd>
<dt><a href="#OptionsType">OptionsType</a> : <code>Object</code></dt>
<dd><p>serify-deserify options type</p>
</dd>
<dt><a href="#OptionsTypes">OptionsTypes</a> : <code>Object</code></dt>
<dd><p>serify-deserify options types</p>
</dd>
<dt><a href="#Options">Options</a> : <code>Object</code></dt>
<dd><p>serify-deserify options object</p>
</dd>
<dt><a href="#PackageInfo">PackageInfo</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="PACKAGE_INFO"></a>

## PACKAGE\_INFO : [<code>PackageInfo</code>](#PackageInfo)
**Kind**: global constant  
<a name="createReduxMiddleware"></a>

## createReduxMiddleware([options]) ⇒ <code>function</code>
create redux middleware

**Kind**: global function  
**Returns**: <code>function</code> - redux middleware  

| Param | Type | Description |
| --- | --- | --- |
| [options] | [<code>Options</code>](#Options) | options object |

<a name="deserify"></a>

## deserify([value], [options]) ⇒ <code>\*</code>
deserify a value

**Kind**: global function  
**Returns**: <code>\*</code> - deserified value  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>\*</code> | value to be deserified |
| [options] | [<code>Options</code>](#Options) | options object |

<a name="serify"></a>

## serify([value], [options]) ⇒ <code>\*</code>
serify a value

**Kind**: global function  
**Returns**: <code>\*</code> - serified value  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>\*</code> | value to be serified |
| [options] | [<code>Options</code>](#Options) | options object |

<a name="serifierCallback"></a>

## serifierCallback ⇒ <code>\*</code>
callback to serify a custom type.

**Kind**: global typedef  
**Returns**: <code>\*</code> - serified value  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | unserified value |

<a name="deserifierCallback"></a>

## deserifierCallback ⇒ <code>\*</code>
callback to deserify a custom type.

**Kind**: global typedef  
**Returns**: <code>\*</code> - unserified value  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | serified value |

<a name="OptionsType"></a>

## OptionsType : <code>Object</code>
serify-deserify options type

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| serifier | [<code>serifierCallback</code>](#serifierCallback) | serifier callback |
| deserifier | [<code>deserifierCallback</code>](#deserifierCallback) | deserifier callback |

<a name="OptionsTypes"></a>

## OptionsTypes : <code>Object</code>
serify-deserify options types

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [...types] | [<code>OptionsType</code>](#OptionsType) | supported types |

<a name="Options"></a>

## Options : <code>Object</code>
serify-deserify options object

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [serifyKey] | <code>string</code> | serify key |
| types | [<code>OptionsTypes</code>](#OptionsTypes) | types object |

<a name="PackageInfo"></a>

## PackageInfo : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| version | <code>string</code> | package version |


---

See more great templates and other tools on
[my GitHub Profile](https://github.com/karmaniverous)!
