import { isValidObject } from './typeCheckers';
import baseKeys from './baseKeys';
import HasProperty from 'es-abstract-has-property';
import IsCallable from 'es-abstract-is-callable';
import ToLength from 'es-abstract-to-length';

/*
 * COLLECTION
 *
 * The object or array that forEach will traverse through.
 *
 * CALLBACKFN
 *
 * `callbackFn` should be a function that accepts three arguments. They are (in
 * order):
 *
 * 1.  currentValue  - The value of the current element being processed in the
 *     collection.
 * 2.  keyOrIndex  -  The index or key of the current element being processed in
 *     the collection.
 * 3.  collection  - The object that forEach is traversing.
 *
 * forEach calls callbackFn once for each element present in the collection.
 *
 * For array and array-like object collections, this is done in ascending order
 * for indices only.
 *
 * For object collections, only the object's own enumerable property keys will
 * be visited. No garuntee is made about what the order in which elements are
 * visited in will be.
 *
 * callbackFn is called only for elements of the collection which actually
 * exist; it is not called for missing elements of the collection.
 *
 * [THISARG]
 *
 * If a `thisArg` parameter is provided, it will be used as the this value for
 * each invocation of callbackFn. If it is not provided, undefined is used
 * instead.
 *
 * EFFECTIVE ELEMENTS & VALUES
 *
 * The range of elements processed by forEach is set before the first call to
 * callbackFn.
 *
 * Each element will only be visited once, regardless of how the collection or
 * its elements may have been modified by any given invokation of callbackFn.
 *
 * For arrays and array-like objects, this will start at index 0 and continue up
 * to the last index. The last index is a number equal to the collection's
 * length (as it was before the first call to callbackFn) minus 1.
 *
 * For objects, only enumerable properties that existed before the first call to
 * callbackFn will be visited.
 *
 * If existing elements of the collection are changed, their value as passed to
 * callbackFn will be the value at the time forEach visits them; elements that
 * are deleted after the call to forEach begins and before being visited are
 * not visited.
 *
 * CONTINUING THE LOOP
 *
 * If callbackFn returns undefined, forEach will move on to the next element.
 *
 * BREAKING THE LOOP
 *
 * Iteration may be stopped early by having callbackFn return (boolean) false.
 */
function innerLooper(collection, callbackFn, thisArg?) {
  var collectionIsArray
  var collectionIsArrayLikeObject
  var collectionIsPlainObject
  var funcResult
  var getObjectKeys
  var getPropName
  var index
  var isPropPresent
  var isObjectPropertyPresent
  var iterable
  var length
  var propIsPresent
  var propName
  var propNameStr
  var props
  var propValue
  var T
  if (collection == null) {
    // Exit early
    // TODO: should an TypeError be thrown?
    return
  }
  if (!IsCallable(callbackFn)) {
    throw new TypeError(callbackFn + ' is not a function')
  }
  if (thisArg) {
    T = thisArg
  }

  /*
   * Someday `getObjectKeys` and `isObjectPropertyPresent` may be configurable
   * options. This would allow for (non-array-like) objects to iterate over
   * inherited properties.
   *
   * Arrays and array-like objects will use the same "keys" and "property is
   * present" process as defined for the `Array.prototype.forEach` method by
   * the ECMAScript standard. As a result, this will not be configurable.
   *
   * [Enumerability and ownership of properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties)
   * [get-prototype-chain](https://github.com/leahciMic/get-prototype-chain/blob/master/get-prototype-chain.js)
   */
  getObjectKeys = defaultGetObjectKeys
  isObjectPropertyPresent = defaultIsObjectPropertyPresent

  collectionIsArray = Array.isArray(collection)
  collectionIsArrayLikeObject =
    collection != null &&
    !IsCallable(collection) &&
    typeof collection.length === 'number'
  collectionIsPlainObject = isValidObject(collection)

  index = 0
  iterable = Object(collection)
  if (collectionIsArray || collectionIsArrayLikeObject) {
    length = ToLength(iterable.length)
    getPropName = function getIndex(index) {
      return index
    }
    isPropPresent = HasProperty
  } else if (collectionIsPlainObject) {
    props = getObjectKeys(collection)
    length = props.length
    getPropName = function getKey(index) {
      return props[index]
    }
    isPropPresent = isObjectPropertyPresent
  }
  while (index < length) {
    propName = getPropName(index)
    propNameStr = String(propName)
    propIsPresent = isPropPresent(iterable, propNameStr)
    if (propIsPresent) {
      propValue = iterable[propNameStr]
      funcResult = callbackFn.call(T, propValue, propName, collection)
      if (funcResult === false) {
        break
      }
    }
    index++
  }
}

function defaultGetObjectKeys(collection) {
  return baseKeys(collection)
}

function defaultIsObjectPropertyPresent(obj, P) {
  return obj.hasOwnProperty(P)
}

export default innerLooper;