import { call } from 'redux-saga';
import asap from 'asap';

function snapshotValue(snapshotOrValue) {
  if (typeof snapshotOrValue === 'object' && typeof snapshotOrValue.val === 'function') {
    return snapshotOrValue.val();
  }
  return snapshotOrValue;
}

const NO_VALUE = Symbol();

export default class FirebaseStream {

  constructor(ref) {
    this.ref = ref;
    this.sentValue = NO_VALUE;
    this.currentValue = NO_VALUE;
    this.resolve = null;
    this.update = ::this.update;
    this.ref.on('value', this.update);
  }

  update(snapshotOrValue) {
    this.currentValue = snapshotValue(snapshotOrValue);
    this.flush();
  }

  flush() {
    if (this.resolve && this.promise && this.sentValue !== this.currentValue) {
      const { resolve } = this;
      this.promise = null;
      this.resolve = null;
      this.sentValue = this.currentValue;
      resolve(this.sentValue);
    }
  }

  next() {
    return call([this, this.nextPromise]);
  }

  nextPromise() {
    if (!this.promise) {
      this.promise = new Promise(resolvePromise => {
        this.resolve = resolvePromise;
        asap(() => this.flush());
      });
    }
    return this.promise;
  }

  close() {
    this.ref.off('value', this.update);
  }

}
