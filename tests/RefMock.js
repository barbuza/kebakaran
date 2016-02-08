import EventEmitter from 'eventemitter3';

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

export default class RefMock extends EventEmitter {

  emitValue(val) {
    this.emit('value', new SnapshotMock(val));
  }

  emitChildAdded(key) {
    this.emit('child_added', new SnapshotMock(undefined, key));
  }

  emitChildRemoved(key) {
    this.emit('child_removed', new SnapshotMock(undefined, key));
  }

}
