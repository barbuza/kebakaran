import EventEmitter from 'eventemitter3';

export default class RefMock extends EventEmitter {

  on(name, listener) {
    super.on(name, listener);
    return listener;
  }

  emitValue(val) {
    this.emit('value', {
      val: () => val,
    });
  }

  emitChildAdded(key) {
    this.emit('child_added', {
      key: () => key,
    });
  }

  emitChildRemoved(key) {
    this.emit('child_removed', {
      key: () => key,
    });
  }

}
