import { isValidObject } from './typeCheckers';
import HasProperty from 'es-abstract-has-property';
import IsCallable from 'es-abstract-is-callable';
import { Iterable } from '../interfaces';
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
function innerLooper(
  collection: any, // @TODO Iterable,
  callbackFn: (
    currentValue: any,
    keyOrIndex: string | number,
    collection: Iterable
  ) => any,
  thisArg?: any
) {
  if (collection === null) {
    return;
  }

  const T = thisArg;

  const collectionIsArray = Array.isArray(collection);
  const collectionIsArrayLikeObject =
    collection != null &&
    !IsCallable(collection) &&
    typeof collection.length === 'number';
  const collectionIsPlainObject = isValidObject(collection);
  
  let getPropName: (index: number | string) => any = () => {};
  const iterable = Object(collection);
  let isPropPresent;
  var length;


  // Setup before iteration
  if (collectionIsArray || collectionIsArrayLikeObject) {
    length = iterable.length;
    getPropName = index => index;
    isPropPresent = HasProperty;
  } else if (collectionIsPlainObject) {
    let props = [] as any;
    for (var key in Object(collection)) {
      if (collection.hasOwnProperty(key) && key !== 'constructor') {
        props.push(key);
      }
    }
    length = props.length;
    getPropName = index => props[index];
    isPropPresent = (obj: Object, prop: string) => obj.hasOwnProperty(prop);
  }
  
  let propName;
  let propIsPresent;
  let propValue;
  let fnResult;
  let index = 0;
  while (index < length) {
    propName = getPropName(index);
    propIsPresent = isPropPresent(iterable, propName);
    if (propIsPresent) {
      propValue = iterable[propName];
      fnResult = callbackFn.call(T, propValue, propName, collection);
      if (fnResult === false) {
        break;
      }
    }
    index++;
  }
}

export default innerLooper;
