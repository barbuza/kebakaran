import isFunction from 'is-function';
import isObject from 'is-object';

export function isEmitter(val) {
  return isObject(val) && isFunction(val.on);
}
