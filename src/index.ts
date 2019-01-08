import innerLooper from './utils/innerLooper';
import { isValidObject } from './utils/typeCheckers';
import { LOOP, DEFAULTS } from './constants';
import { Options, Iterable } from './interfaces';

export default function traversalMap(collection: Iterable, callbackFn: Function, options?: Options) {
  if (options) {
    // If it doesn't throw it means that the options were valid
    validateOptions(options);
  }

  const SETTINGS = { ...DEFAULTS, ...options || {} }

  forEachLoop(
    collection,
    callbackFn,
    '',
    SETTINGS,
    Array.isArray(collection),
    isValidObject(collection)
  )
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
    innerLooper(value, (
      childValue,
      keyOrIndex,
      parentCollection
    ) => {
      let deepPath
      if (valueIsArray) {
        deepPath = path + '[' + keyOrIndex + ']'
      } else if (valueIsPlainObject) {
        if (settings.useDotNotationOnKeys) {
          deepPath = path ? path + '.' + keyOrIndex : keyOrIndex
        } else {
          deepPath = path + '[' + keyOrIndex + ']'
        }
      }

      let fnReturnCode = fn.call(
        parentCollection,
        childValue,
        keyOrIndex,
        deepPath,
      )

      /*
       * -   If the code is a number, convert it to a string
       * -   If the code is undefined, convert it to `LOOP_CONTINUE`
       * -   If the code is false, convert it to `LOOP_BREAK_CURRENT`
       */
      if (Number.isFinite(fnReturnCode)) {
        fnReturnCode = fnReturnCode.toString()
      } else if (typeof fnReturnCode === 'undefined') {
        fnReturnCode = LOOP.CONTINUE
      } else if (fnReturnCode === false) {
        fnReturnCode = LOOP.BREAK_CURRENT
      }

      /*
       * Break out of the current loop if the fn return code says so.
       */
      if (fnReturnCode === LOOP.BREAK_CURRENT) {
        return false
      }

      /*
       * Break out of the current loop if the fn return code says so AND
       * tell all ancestor loops that they should break.
       */
      if (fnReturnCode === LOOP.BREAK_ALL) {
        loopReturnCode = fnReturnCode
        return false
      }

      /*
       * Get the value at `keyOrIndex` again, because it may have been
       * changed by `fn` or a sibling `forEachLoop`.
       */
      let childValuePostFn = parentCollection[keyOrIndex]
      let childValuePostFnIsArray = Array.isArray(childValuePostFn)
      let childValuePostFnIsObject = isValidObject(childValuePostFn)

      /*
       * While skipping the function call may be optional, skipping the loop
       * iteration with a circular reference is NOT optional.
       */

      if (childValuePostFnIsArray || childValuePostFnIsObject) {
        if (fnReturnCode !== LOOP.SKIP_CHILDREN) {
          let childLoopReturnCode = forEachLoop(
            childValuePostFn,
            fn,
            deepPath,
            settings,
            childValuePostFnIsArray,
            childValuePostFnIsObject
          )

          /*
           * Break out of the current loop if the loop return code says so.
           */
          if (childLoopReturnCode === LOOP.BREAK_ALL) {
            loopReturnCode = childLoopReturnCode
            return false
          }
        }
      }
    })
  }
  return loopReturnCode
}

function validateOptions(options: Options): void {
  for (let key in options) {
    const typeofOption = typeof options[key];
    if (typeofOption !== 'boolean') {
      throw new TypeError(`Ivalid option, ${key} sould be a boolean, instead got a ${typeofOption}`);
    }
  }
  return;
}