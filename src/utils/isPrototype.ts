/*
 * Checks if `value` is likely a prototype object.
 *
 * This method was extracted from the lodash library where is was a private
 * method.
 *
 * Reference:
 * [isPrototype](https://github.com/lodash/lodash/blob/165572022d58d3e39e928b33ff9b9589cc60b67b/lodash.js#L6408-L6420)
 */
function isPrototype(value) {
  var Ctor = value && value.constructor;
  var proto =
    (typeof Ctor === 'function' && Ctor.prototype) || Object.prototype;

  return value === proto;
}

export default isPrototype;
