import innerLooper from './utils/innerLooper';
import { isValidObject } from './utils/typeCheckers';
import { LOOP, DEFAULTS } from './constants';
import { Options, Iterable } from './interfaces';

export default function traversalMap(
  collection: Iterable,
  callbackFn: Function,
  options?: Options
) {
  if (options) {
    // If it doesn't throw it means that the options were valid
    validateOptions(options);
  }

  const SETTINGS = { ...DEFAULTS, ...(options || {}) };

  forEachLoop(
    collection,
    callbackFn,
    '',
    SETTINGS,
    Array.isArray(collection),
    isValidObject(collection)
  );
}

function forEachLoop(
  value: any,
  fn: Function,
  path: string,
  settings: Options,
  valueIsArray: boolean,
  valueIsPlainObject: boolean
) {
  let loopReturnCode;

  if (valueIsArray || valueIsPlainObject) {
    innerLooper(value, (childValue, keyOrIndex, parentCollection) => {
      let deepPath;
      if (valueIsArray) {
        deepPath = `${path}[${keyOrIndex}]`;
      } else if (valueIsPlainObject) {
        if (settings.useDotNotationOnKeys) {
          deepPath = path ? `${path}.${keyOrIndex}` : keyOrIndex;
        } else {
          deepPath = `${path}['${keyOrIndex}']`;
        }
      }

      let fnReturnCode = fn.call(
        parentCollection,
        childValue,
        keyOrIndex,
        deepPath
      );

      fnReturnCode = getFunctionReturnCode(fnReturnCode);

      if (fnReturnCode === LOOP.BREAK_CURRENT) {
        return false;
      } else if (fnReturnCode === LOOP.BREAK_ALL) {
        return false;
      }

      /*
       * This is necesary because calling the `fn` may have changed the value.
       * For example if you dont return the value in the `fn` here it will be undefined.
       */
      let childValuePostFn = parentCollection[keyOrIndex];
      let childValuePostFnIsArray = Array.isArray(childValuePostFn);
      let childValuePostFnIsObject = isValidObject(childValuePostFn);

      if (childValuePostFnIsArray || childValuePostFnIsObject) {
        if (fnReturnCode !== LOOP.SKIP_CHILDREN) {
          let childLoopReturnCode = forEachLoop(
            childValuePostFn,
            fn,
            deepPath,
            settings,
            childValuePostFnIsArray,
            childValuePostFnIsObject
          );

          if (childLoopReturnCode === LOOP.BREAK_ALL) {
            return false;
          }
        }
      }
    });
  }
  return loopReturnCode;
}

function validateOptions(options: Options): void {
  for (let key in options) {
    const typeofOption = typeof options[key];
    if (typeofOption !== 'boolean') {
      throw new TypeError(
        `Ivalid option, ${key} sould be a boolean, instead got a ${typeofOption}`
      );
    }
  }
  return;
}

/*
 * If the code is:
 * number   = convert it to a string
 * undefined = convert it to `LOOP_CONTINUE`
 * false    = convert it to `LOOP_BREAK_CURRENT`
 */
function getFunctionReturnCode(code: number | undefined | false) {
  if (typeof code === 'undefined') {
    return LOOP.CONTINUE;
  } else if (code === false) {
    return LOOP.BREAK_CURRENT;
  } else if (Number.isFinite(code)) {
    return code.toString();
  }
}
