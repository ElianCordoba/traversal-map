export function isValidPlainObject(obj: any): obj is Object {
  return (
    isObject(obj) && !Array.isArray(obj) && !isInstanceOfForbbidenClass(obj)
  );
}

export function isArrayLikeObject(collection: any) {
  return (
    collection !== null &&
    !isFunction(collection) &&
    typeof collection.length === 'number'
  );
}

function isObject(obj: any): obj is Object {
  return obj !== null && typeof obj === 'object';
}

function isInstanceOfForbbidenClass(obj: any): boolean {
  return (
    obj instanceof Date ||
    obj instanceof Error ||
    obj instanceof RegExp ||
    obj instanceof Map ||
    obj instanceof WeakMap ||
    obj instanceof Set ||
    obj instanceof WeakSet
  );
}

function isFunction(value: any): value is Function {
  return typeof value === 'function' && value.call;
}
