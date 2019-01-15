import { isValidObject, isFunction } from './typeCheckers';
import { Iterable } from '../interfaces';

function innerLooper(
  collection: Iterable,
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
  const collectionIsArray = Array.isArray(collection);
  const collectionIsArrayLikeObject =
    collection !== null &&
    !isFunction(collection) &&
    typeof (collection as any).length  === 'number';
  const collectionIsPlainObject = isValidObject(collection);

  let length;
  const iterable = Object(collection);
  let getPropName: (index: number | string) => any = () => {}; 

  // Setup before iteration
  if (collectionIsArray || collectionIsArrayLikeObject) {
    length = iterable.length;
    getPropName = index => index;
  } else if (collectionIsPlainObject) {
    let props = [] as any;
    for (let key in Object(collection)) {
      if (collection.hasOwnProperty(key) && key !== 'constructor') {
        props.push(key);
      }
    }
    length = props.length;
    getPropName = index => props[index];
  }

  let propName;
  let propIsPresent;
  let propValue;
  let fnResult;
  let index = 0;
  while (index < length) {
    propName = getPropName(index);
    propIsPresent = iterable.hasOwnProperty(propName);
    if (propIsPresent) {
      propValue = iterable[propName];
      fnResult = callbackFn.call(thisArg, propValue, propName, collection);
      if (fnResult === false) {
        break;
      }
    }
    index++;
  }
}

export default innerLooper;
