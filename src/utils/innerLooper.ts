import { isValidObject, isFunction } from './typeCheckers';
import HasProperty from 'es-abstract-has-property';
import { Iterable } from '../interfaces';

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
    collection !== null &&
    !isFunction(collection) &&
    typeof collection.length === 'number';
  const collectionIsPlainObject = isValidObject(collection);

  let getPropName: (index: number | string) => any = () => {};
  const iterable = Object(collection);
  let isPropPresent;
  let length;

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
