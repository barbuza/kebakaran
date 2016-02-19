import asap from 'asap';
import isFunction from 'is-function';

import { isEqual } from './isEqual';

const NO_VALUE = Symbol('NO_VALUE');

export function sagaCbStrict() {
  let nextCallback = null;
  const queue = [];
  let callbackCopy;

  function listener(data) {
    if (nextCallback) {
      [callbackCopy, nextCallback] = [nextCallback, null];
      callbackCopy(null, data);
    } else {
      queue.push(data);
    }
  }

  function callback(cb) {
    if (queue.length) {
      const data = queue.shift();
      cb(null, data);
    } else {
      nextCallback = cb;
    }
  }

  return { callback, listener };
}

export function sagaCbLoose() {
  let nextCallback = null;
  let nextData = NO_VALUE;
  let dataCopy;
  let callbackCopy;

  function listener(data) {
    if (nextCallback) {
      [callbackCopy, nextCallback, nextData] = [nextCallback, null, NO_VALUE];
      callbackCopy(null, data);
    } else {
      nextData = data;
    }
  }

  function callback(cb) {
    if (nextData !== NO_VALUE) {
      [dataCopy, nextData] = [nextData, NO_VALUE];
      cb(null, dataCopy);
    } else {
      nextCallback = cb;
    }
  }

  return { callback, listener };
}

export function sagaCbEqual() {
  let nextCallback = null;
  let nextData = NO_VALUE;
  let lastData = NO_VALUE;
  let callbackCopy;

  function flush() {
    if (nextData !== NO_VALUE && !isEqual(nextData, lastData) && isFunction(nextCallback)) {
      [callbackCopy, nextCallback, lastData, nextData] = [nextCallback, null, nextData, NO_VALUE];
      callbackCopy(null, lastData);
    }
  }

  function listener(data) {
    nextData = data;
    asap(flush);
  }

  function callback(cb) {
    nextCallback = cb;
    asap(flush);
  }

  return { callback, listener };
}
