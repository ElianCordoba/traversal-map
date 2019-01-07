import isPrototype from './isPrototype';

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * This method was extracted from the lodash library where is was a private
 * method.
 *
 * Reference:
 * [baseKeys](https://github.com/lodash/lodash/blob/165572022d58d3e39e928b33ff9b9589cc60b67b/lodash.js#L3486-L3504)
 * [nativeKeys](https://github.com/lodash/lodash/blob/165572022d58d3e39e928b33ff9b9589cc60b67b/lodash.js#L1516)
 * [overArg](https://github.com/lodash/lodash/blob/165572022d58d3e39e928b33ff9b9589cc60b67b/lodash.js#L1209-L1221)
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return Object.keys(Object(object))
  }
  var result = [] as any
  for (var key in Object(object)) {
    if (object.hasOwnProperty(key) && key !== 'constructor') {
      result.push(key)
    }
  }
  return result
}

export default baseKeys;