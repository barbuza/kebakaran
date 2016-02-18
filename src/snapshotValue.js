import isObject from 'is-object';
import isFunction from 'is-function';

export function snapshotValue(snapshotOrValue) {
  if (isObject(snapshotOrValue) && isFunction(snapshotOrValue.val)) {
    return snapshotOrValue.val();
  }
  return snapshotOrValue;
}
