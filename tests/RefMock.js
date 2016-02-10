import { Emitter } from '../src/Emitter';

class SnapshotMock {

  constructor(val, key) {
    this._val = val;
    this._key = key;
  }

  val() {
    return this._val;
  }

  key() {
    return this._key;
  }

  forEach(...args) {
    Object.keys(this._val).map(val => new SnapshotMock(undefined, val)).forEach(...args);
  }

}

const NO_VALUE = Symbol();

export default class RefMock extends Emitter {

  data = NO_VALUE;

  subscribe() {

  }

  close() {

  }

  hasData() {
    return this.data !== NO_VALUE;
  }

  emitValue(val) {
    this.data = new SnapshotMock(val);
    this.emit('value', this.data);
  }

  emitChildAdded(key) {
    this.emit('child_added', new SnapshotMock(undefined, key));
  }

  emitChildRemoved(key) {
    this.emit('child_removed', new SnapshotMock(undefined, key));
  }

}
