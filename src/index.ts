import innerLooper from './utils/innerLooper';
import isPlainObject from 'lodash.isplainobject';
import merge from 'lodash.merge';

const LOOP_CONTINUE = '0' // Alternate: `undefined`
const LOOP_BREAK_CURRENT = '10' // Alternate: `false`
const LOOP_BREAK_ALL = '11'
const LOOP_SKIP_CHILDREN = '20'

function circularStats(value, ancestry) {
  function detectCircularFindIndex(ancestor, ancestorindex) {
    return Object.is(value, ancestor.value)
  }
  var ancestorIndex = ancestry.findIndex(detectCircularFindIndex)
  var isCircular = ancestorIndex > -1
  var ancestorPath
  if (isCircular) {
    ancestorPath = ancestry[ancestorIndex].path
  }
  return {
    ancestorIndex: ancestorIndex,
    ancestorPath: ancestorPath,
    isCircular: isCircular
  }
}

/**
 * Loops recursively through an array or plain object with optional
 * consideration for circular references that is enabled by default.
 */
function traversalMap(collection, callbackFn, options?) {
  /*
   * Handle option processing so that it only needs to be done once before
   * passing it to the internal recursive loop.
   */
  const DEFAULTS = {
    enableCircularReferenceChecking: true,
    enablePathArray: false,
    skipCircularReferences: false,
    useDotNotationOnKeys: true
  }
  const SETTINGS = merge({}, DEFAULTS, options)

  /*
   * Light value checking/validation/coercing. Prevents the need to check in
   * each iteration.
   * TODO: A more permanent solution should be checking / validating options
   * before they are merged.
   */
  if (typeof SETTINGS.enableCircularReferenceChecking !== 'boolean') {
    SETTINGS.enableCircularReferenceChecking =
      DEFAULTS.enableCircularReferenceChecking
  }
  if (typeof SETTINGS.enablePathArray !== 'boolean') {
    SETTINGS.enablePathArray = DEFAULTS.enablePathArray
  }
  if (typeof SETTINGS.skipCircularReferences !== 'boolean') {
    SETTINGS.skipCircularReferences = DEFAULTS.skipCircularReferences
  }
  if (typeof SETTINGS.useDotNotationOnKeys !== 'boolean') {
    SETTINGS.useDotNotationOnKeys = DEFAULTS.useDotNotationOnKeys
  }

  forEachLoop(
    collection,
    callbackFn,
    '',
    SETTINGS.enablePathArray ? [] : null,
    [],
    SETTINGS,
    Array.isArray(collection),
    isPlainObject(collection)
  )
}

function forEachLoop(
  value,
  fn,
  path,
  pathArray,
  ancestry,
  settings,
  valueIsArray,
  valueIsPlainObject
) {
  var checkingIsEnabled = settings.enableCircularReferenceChecking
  var pathArrayIsEnabled = settings.enablePathArray
  var skipCircularReferences = settings.skipCircularReferences
  var useDotNotationOnKeys = settings.useDotNotationOnKeys
  var loopReturnCode

  if (valueIsArray || valueIsPlainObject) {
    /*
     * Add a "family member" to the "family tree".
     *
     * Work on a copy of ancestry, because if we work on a reference, we would
     * have to detect and remove siblings.
     */
    // There has to be a more performant way to make a shallow copy.
    ancestry = ancestry.concat()
    ancestry.push({
      path: path,
      value: value
    })

    /*
     * Loop through each member of the collection.
     */
    innerLooper(value, function forEachCollectionIteratee(
      childValue,
      keyOrIndex,
      parentCollection
    ) {
      var childLoopReturnCode
      var childValueIsCircular
      var childValueMayLoop
      var childValuePostFn
      var childValuePostFnIsArray
      var childValuePostFnIsObject
      var cStats
      var cStatsPostFn
      var deepPath
      var deepPathArray
      var fnReturnCode
      var skipFnCall
      var skipLoop

      childValueIsCircular = checkingIsEnabled ? false : null
      childValueMayLoop = Array.isArray(childValue) || isPlainObject(childValue)
      skipFnCall = false
      skipLoop = false
      if (valueIsArray) {
        deepPath = path + '[' + keyOrIndex + ']'
      } else if (valueIsPlainObject) {
        if (useDotNotationOnKeys) {
          deepPath = path ? path + '.' + keyOrIndex : keyOrIndex
        } else {
          deepPath = path + '[' + keyOrIndex + ']'
        }
      }
      if (pathArrayIsEnabled) {
        deepPathArray = pathArray.concat()
        deepPathArray.push(keyOrIndex)
      } else {
        deepPathArray = null
      }

      /*
       * Prevent the cost of the circular reference check on values that are
       * not iterated through.
       */
      if (childValueMayLoop && checkingIsEnabled) {
        cStats = circularStats(childValue, ancestry)
        childValueIsCircular = cStats.isCircular
        if (childValueIsCircular) {
          if (skipCircularReferences) {
            skipFnCall = true
          } else {
            childValue = ['[CircularReference]', cStats.ancestorPath]
          }
        }
      }

      if (!skipFnCall) {
        fnReturnCode = fn.call(
          parentCollection,
          childValue,
          keyOrIndex,
          parentCollection,
          deepPath,
          deepPathArray,
          childValueIsCircular
        )
      }

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
      childValuePostFnIsObject = isPlainObject(childValuePostFn)

      /*
       * While skipping the function call may be optional, skipping the loop
       * iteration with a circular reference is NOT optional.
       */
      if (childValuePostFnIsArray || childValuePostFnIsObject) {
        cStatsPostFn = circularStats(childValuePostFn, ancestry)
        skipLoop = cStatsPostFn.isCircular
        if (!skipLoop && fnReturnCode !== LOOP_SKIP_CHILDREN) {
          childLoopReturnCode = forEachLoop(
            childValuePostFn,
            fn,
            deepPath,
            deepPathArray,
            ancestry,
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

export default traversalMap;
