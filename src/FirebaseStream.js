import invariant from 'invariant';
import { cps } from 'redux-saga/effects';
import isFunction from 'is-function';

import { sagaCbLoose, sagaCbStrict } from './sagaCb';
import { snapshotValue } from './snapshotValue';
import { isEmitter } from './isEmitter';

export class FirebaseStream {

  constructor(ref, loose = true) {
    invariant(isEmitter(ref), 'FirebaseStream first arg must be emitter');

    let makeConstructor;
    if (isFunction(loose)) {
      makeConstructor = loose;
    } else if (loose) {
      makeConstructor = sagaCbLoose;
    } else {
      makeConstructor = sagaCbStrict;
    }

    const { listener, callback } = makeConstructor();
    this.listener = val => listener(snapshotValue(val));
    this.callback = callback;

    this.ref = ref;
    this.ref.on('value', this.listener);
  }

  next() {
    return cps(this.callback);
  }

  close() {
    this.ref.off('value', this.listener);
  }

}

export function stream(ref, loose) {
  return new FirebaseStream(ref, loose);
}
