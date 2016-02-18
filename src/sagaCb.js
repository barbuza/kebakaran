import invariant from 'invariant';
import isEqual from 'deep-equal';
import asap from 'asap';
import isFunction from 'is-function';

export function sagaCbStrict() {
  let nextCallback = null;
  const queue = [];

  function listener(data) {
    if (nextCallback) {
      const callbackCopy = nextCallback;
      nextCallback = null;
      callbackCopy(null, data);
    } else {
      queue.push(data);
    }
  }

  function callback(cb) {
    invariant(queue.length || !nextCallback, 'invalid state');
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
  let nextData = null;

  function listener(data) {
    if (nextCallback) {
      const callbackCopy = nextCallback;
      nextCallback = null;
      nextData = null;
      callbackCopy(null, data);
    } else {
      nextData = data;
    }
  }

  function callback(cb) {
    invariant(nextData || !nextCallback, 'invalid state');
    if (nextData) {
      const dataCopy = nextData;
      nextData = null;
      cb(null, dataCopy);
    } else {
      nextCallback = cb;
    }
  }

  return { callback, listener };
}

const NO_VALUE = Symbol();

export function sagaCbEqual() {
  let nextCallback = null;
  let nextData = NO_VALUE;
  let lastData = NO_VALUE;

  function flush() {
    if (nextData !== NO_VALUE && !isEqual(nextData, lastData) && isFunction(nextCallback)) {
      lastData = nextData;
      const dataCopy = nextData;
      const callbackCopy = nextCallback;
      nextData = NO_VALUE;
      nextCallback = null;
      callbackCopy(null, dataCopy);
    }
  }

  function listener(data) {
    nextData = data;
    asap(flush);
  }

  function callback(cb) {
    invariant(nextData || !nextCallback, 'invalid state');
    nextCallback = cb;
    asap(flush);
  }

  return { callback, listener };
}
