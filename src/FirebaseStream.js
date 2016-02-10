import invariant from 'invariant';
import { cps } from 'redux-saga';
import { sagaCbLoose, sagaCbStrict } from './sagaCb';
import { snapshotValue } from './snapshotValue';

export class FirebaseStream {

  constructor(ref, loose = true) {
    invariant(ref, 'FirebaseStream first arg is required');

    const { listener, callback } = loose ? sagaCbLoose() : sagaCbStrict();
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
