# API Documentation

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
</dl>

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

