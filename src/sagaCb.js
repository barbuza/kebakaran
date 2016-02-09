import invariant from 'invariant';

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
