import { call } from 'redux-saga';
import asap from 'asap';

function snapshotValue(snapshotOrValue) {
  if (typeof snapshotOrValue === 'object' && typeof snapshotOrValue.val === 'function') {
    return snapshotOrValue.val();
  }
  return snapshotOrValue;
}

export default class FirebaseStream {

  static noValue = Symbol();

  constructor(ref) {
    this.ref = ref;
    this.sentValue = this.constructor.noValue;
    this.currentValue = this.constructor.noValue;
    this.resolve = null;
    this.listener = this.ref.on('value', ::this.update);
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
    return call([this, this._nextPromise]);
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
    this.ref.off('value', this.listener);
  }

}
