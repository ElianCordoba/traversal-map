const isPlainObject = require('lodash.isplainobject')
const IsCallable = require('es-abstract-is-callable')
const HasProperty = require('es-abstract-has-property')

/**
 * A utility to mimic the default "foreach" method's means of determining
 * whether or not a property still exists. This is intended to support other
 * "foreach" implementations that don't have this sort of check built in.
 *
 * @param  {Object}  obj - The object to check
 * @param  {String}  P   - The name of the property being checked
 * @return {Boolean}     - A boolean indicating the result of the check
 */
function isPropertyPresent(obj, P) {
  var isPropPresent
  var objIsArray
  var objIsArrayLikeObject
  var objIsPlainObject

  objIsArray = Array.isArray(obj)
  objIsArrayLikeObject =
    obj != null && !IsCallable(obj) && typeof obj.length === 'number'
  objIsPlainObject = isPlainObject(obj)

  if ((objIsArray || objIsArrayLikeObject) && isIndex(P, obj.length)) {
    isPropPresent = HasProperty
  } else if (objIsPlainObject) {
    isPropPresent = function hasOwnProp(obj, P) {
      return obj.hasOwnProperty(P)
    }
  }
  return isPropPresent(obj, P)
}

function isIndex(value, length) {
  var MAX
  if (!Number.isFinite(value)) {
    return false
  }
  MAX = Number.isFinite(length) ? length : Number.MAX_SAFE_INTEGER
  return value >= 0 && value % 1 === 0 && value <= MAX
}

module.exports = isPropertyPresent
