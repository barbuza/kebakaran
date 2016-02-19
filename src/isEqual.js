import deepEqual from 'deep-equal';

export function isEqual(a, b) {
  return typeof a === typeof b && deepEqual(a, b);
}
