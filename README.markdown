# for-each-safe

Recursively loop through the elements of a 'collection' (an array, an array-like object, or a plain object) and invoke 'callbackFn' for each element while protected against circular references.

## Installation Using [npm](https://docs.npmjs.com/getting-started/installing-npm-packages-locally)

```
npm install for-each-safe
```

## Example Usage

```javascript
var forEach = require('for-each-safe')

var data = {
  foo: 100,
  bar: 200,
  baz:  42,
  d: {
    lorem: 9001,
    ipsum:   -1
  },
  e: [
    "red",
    "white",
    "green",
    "blue",
    ,
    "yellow"
  ]
}

// Add a circular reference for illustration.
data.d.dolor = data.d

// Add a property with undefined and null values to compare against a deletion.
var declaredButUndefined
data.f = undefined
data.g = declaredButUndefined
data.h = null

// Values don't exist in the array at indices 4 and 6-9.
data.e[10] = "purple"

forEach(data, function(value, keyOrIndex, collection, path, pathArray, isCircular) {
  if (keyOrIndex === 'bar') {
    // Unvisted values that are deleted are not iterated on.
    delete collection.baz
  }
  if (isCircular) {
    console.log(path + ' = ' + value[0], ';', value[1])
  } else {
    console.log(path + ' = ' + value)
  }
})
// => foo = 100
// => bar = 200
// => d = [object Object]
// => d.lorem = 9001
// => d.ipsum = -1
// => d.dolor = [CircularReference] ; d
// => e = red,white,green,blue
// => e[0] = red
// => e[1] = white
// => e[2] = green
// => e[3] = blue
// => f = undefined
// => g = undefined
// => h = null
```

## Definitions

### Array-like Object

An array like object is an object that:

-   Is NOT `null`
-   Is NOT callable (not a function)
-   Has a property `length` that is a number.

The default loop implementation further coerces "length" following [ECMAScript's ToLength abstract operation](https://github.com/npetruzzelli/es-abstract-to-length).

### Circular Reference

A circular reference (aka. cyclic reference) occurs when a descendent property has a value that is a reference to one of its ancestors.

In the context of iteration, this can cause an infinite loop if it isn't detected and handled.

To handle this, **for-each-safe** tracks a value's ancestry. If it finds itself, then it knows not to iterate again.

It is important to note that two different objects can have identical structures and values. So long as they are not a reference to the same data, they will not be considered circular references.

-   MDN: [TypeError: cyclic object value](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value)
-   Wikipedia: [Circular reference](https://en.wikipedia.org/wiki/Circular_reference)


### Plain Object

This module uses [lodash's definition of a plain object](https://lodash.com/docs/4.17.4#isPlainObject):

> ... an object created by the Object constructor or one with a [[Prototype]] of null.
> 
> (...)
> 
> ```javascript
> function Foo() {
>   this.a = 1;
> }
>  
> _.isPlainObject(new Foo);
> // => false
>  
> _.isPlainObject([1, 2, 3]);
> // => false
>  
> _.isPlainObject({ 'x': 0, 'y': 0 });
> // => true
>  
> _.isPlainObject(Object.create(null));
> // => true
> ```

## API

### forEachSafe(collection, callbackFn[, options])

#### collection

Type: `Array` or `Object` (array-like or plain)

The object to iterate through. 

#### callbackFn

Type: `Function`

A function to call once per element in the collection. It accepts the following arguments:

1.  `value` - The value of the current element being processed in the
    collection.
2.  `keyOrIndex` - The index or key of the current element being processed in the collection. Indices will be integers. Keys will be strings.
3.  `collection` - The object currently being iterated through / traversed.
4.  `path` - A string representing the property path relative to the top most level of the collection passed to `forEachSafe()`. Indices are surrounded by square brackets (`[`, `]`). Object keys are preceeded by a dot (`.`) unless they are at the top level. Object keys may optionally be forced into the bracket syntax.
5.  `pathArray` - `null` if the feature is disabled. If enabled, this will contain an array of strings that make up `path`, without any additional dots or brackets.
6.  `valueIsCircular` - A boolean value indicating whether or not the value was determined to be a circular reference. If checking is disabled, the value will be `null`.

##### Flow Control

Special return values from `callbackFn` can be used to modify the flow of your code.

-   `"0"` or `undefined`: Continue iteration normally.
-   `"10"` or `false`: Break the loop at the current depth. This skips only sibling elements that have not yet been visited.
-   `"11"`: Break the loop at all depths. Any element that hasn't already been visited will be skipped.
-   `"20"`: Skip own descendent elements. Elements that are not descendents of the currently visited value will be iterated on normally.

#### options

Type: `Object`

Options to modify the loop's behavior.

```javascript
const DEFAULTS = {
  enableCircularReferenceChecking: true,
  enablePathArray: false,
  skipCircularReferences: false,
  useDotNotationOnKeys: true
}
```

##### options.enableCircularReferenceChecking

Type: `Boolean`

Default: `true`

While checking for circular references is a primary feature of this module, it is still optional. Setting this option to `false` will disable all checks for circular references. This may be useful for situations where you don't want the additional performance cost of the check, but it doesn't make sense to include yet another module for loops.

**Use caution.** Make sure you understand the impact on your code when disabling this feature.

##### options.enablePathArray

Type: `Boolean`

Default: `false`

Setting this to `true` will construct an array of strings representing the path, without additional brackets or dots. This is disabled by default to improve perfomance. It is intended to support cases where object keys may contain a combination of square brackets or dots that could confuse string parsing for a path.

When this feature is disabled `null` will be passed to `callbackFn` instead of an array.

##### options.skipCircularReferences

Type: `Boolean`

Default: `false`

Setting this to `true` will prevent `callbackFn` from being called on a circular reference.

When this setting is `false`, the `value` argument to `callbackFn` is replaced when a circular reference is detected. The replacement is an array that contains the string "`[CircularReference]`
" as its first element and a string that is the path to ancestor where the reference first appears as its second element.

If for some reason, you still need the reference in `callbackFn`, if can be obtained using `keyOrIndex` and `collection`:

```javascript
var originalValue;
if (valueIsCircular) {
  originalValue = collection[keyOrIndex];
}
```

Internally, [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) is used to compare values with their ancestors.

Regardless of this setting, if, after `callbackFn`, the value at the key or index is still a circular reference, it will be skipped and deep iteration will not be performed on it.

##### options.useDotNotationOnKeys

Type: `Boolean`

Default: `true`

Setting this false forces object keys to use the bracket notation .

A reason you may want to disable dot notation is that completely supporting the dot notation for property paths would require being able to determine whether or not a given string is a valid ECMAScript identifier. This can vary between ECMAScript versions and whether or not you are using strict mode.

There is also a performance savings in not executing additional code to check every individual key. It may not be as nice to look at, but full bracket notation is understandable and can still be used with tools like lodash's [get](https://lodash.com/docs/4.17.4#get) and [set](https://lodash.com/docs/4.17.4#set) methods.

lodash is capable of understanding the dot notation even if the property name isn't a valid identifier, since it internally it is working with strings instead of identifiers.

Checking if the key is a valid identifier is something you can do inside `callbackFn` if needed.

## Attribution and History

I needed to deep traverse an object. None of the libraries I normally use had what I needed, so I made my own module drawing from the ECMAScript specification and a small amount of code from private methods in [lodash](https://github.com/lodash/lodash).

This module started out based on the [deep-for-each](https://github.com/IndigoUnited/js-deep-for-each) module. The end result is so different that now you can only say it was inspired by it.
