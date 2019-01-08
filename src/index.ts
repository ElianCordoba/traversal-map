import innerLooper from './utils/innerLooper';
import { isValidObject } from './utils/typeCheckers';
import { Options } from './interfaces';

const DEFAULTS = {
  enablePathArray: false,
  useDotNotationOnKeys: true
}

const LOOP_CONTINUE = '0' // Alternate: `undefined`
const LOOP_BREAK_CURRENT = '10' // Alternate: `false`
const LOOP_BREAK_ALL = '11'
const LOOP_SKIP_CHILDREN = '20'

function traversalMap(collection, callbackFn, options?: Options) {
  if (options) {
    // If it doesn't throw it means that the options were valid
    validateOptions(options);
  }
  
  const SETTINGS = { ...DEFAULTS, ...options || {} }

  forEachLoop(
    collection,
    callbackFn,
    '',
    SETTINGS.enablePathArray ? [] : null,
    SETTINGS,
    Array.isArray(collection),
    isValidObject(collection)
  )
}

function forEachLoop(
  value,
  fn,
  path,
  pathArray,
  settings,
  valueIsArray,
  valueIsPlainObject
) {
  var loopReturnCode

  if (valueIsArray || valueIsPlainObject) {
    innerLooper(value, function forEachCollectionIteratee(
      childValue,
      keyOrIndex,
      parentCollection
    ) {
      var childLoopReturnCode
      var childValuePostFn
      var childValuePostFnIsArray
      var childValuePostFnIsObject
      var deepPath
      var deepPathArray
      var fnReturnCode

      if (valueIsArray) {
        deepPath = path + '[' + keyOrIndex + ']'
      } else if (valueIsPlainObject) {
        if (settings.useDotNotationOnKeys) {
          deepPath = path ? path + '.' + keyOrIndex : keyOrIndex
        } else {
          deepPath = path + '[' + keyOrIndex + ']'
        }
      }

      if (settings.enablePathArray) {
        deepPathArray = pathArray.concat()
        deepPathArray.push(keyOrIndex)
      } else {
        deepPathArray = null
      }

      fnReturnCode = fn.call(
        parentCollection,
        childValue,
        keyOrIndex,
        deepPath,
        deepPathArray,
      )

      /*
       * -   If the code is a number, convert it to a string
       * -   If the code is undefined, convert it to `LOOP_CONTINUE`
       * -   If the code is false, convert it to `LOOP_BREAK_CURRENT`
       */
      if (Number.isFinite(fnReturnCode)) {
        fnReturnCode = fnReturnCode.toString()
      } else if (typeof fnReturnCode === 'undefined') {
        fnReturnCode = LOOP_CONTINUE
      } else if (fnReturnCode === false) {
        fnReturnCode = LOOP_BREAK_CURRENT
      }

      /*
       * Break out of the current loop if the fn return code says so.
       */
      if (fnReturnCode === LOOP_BREAK_CURRENT) {
        return false
      }

      /*
       * Break out of the current loop if the fn return code says so AND
       * tell all ancestor loops that they should break.
       */
      if (fnReturnCode === LOOP_BREAK_ALL) {
        loopReturnCode = fnReturnCode
        return false
      }

      /*
       * Get the value at `keyOrIndex` again, because it may have been
       * changed by `fn` or a sibling `forEachLoop`.
       */
      childValuePostFn = parentCollection[keyOrIndex]
      childValuePostFnIsArray = Array.isArray(childValuePostFn)
      childValuePostFnIsObject = isValidObject(childValuePostFn)

      /*
       * While skipping the function call may be optional, skipping the loop
       * iteration with a circular reference is NOT optional.
       */
      if (childValuePostFnIsArray || childValuePostFnIsObject) {
        if (fnReturnCode !== LOOP_SKIP_CHILDREN) {
          childLoopReturnCode = forEachLoop(
            childValuePostFn,
            fn,
            deepPath,
            deepPathArray,
            settings,
            childValuePostFnIsArray,
            childValuePostFnIsObject
          )

          /*
           * Break out of the current loop if the loop return code says so.
           */
          if (childLoopReturnCode === LOOP_BREAK_ALL) {
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

export default traversalMap;