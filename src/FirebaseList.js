import EventEmitter from 'eventemitter3';

import FirebaseStruct from './FirebaseStruct';

const noValue = Symbol();

export default class FirebaseList extends EventEmitter {

  keys = [];
  items = {};
  values = {};

  constructor(ref, getFields, idField = 'id') {
    super();

    this.ref = ref;
    this.getFields = getFields;
    this.idField = idField;

    this.subscribe();
  }

  subscribe() {
    this.onChildAdded = ::this.onChildAdded;
    this.onChildRemoved = ::this.onChildRemoved;
    this.ref.on('child_added', this.onChildAdded);
    this.ref.on('child_removed', this.onChildRemoved);
  }

  onChildAdded(c) {
    const key = c.key();
    const item = new FirebaseStruct(this.getFields, key);

    item.on('value', value => {
      this.onValue(key, value);
    });

    this.values[key] = noValue;
    this.keys.push(key);
    this.items[key] = item;

    this.flush();
  }

  onChildRemoved(c) {
    const key = c.key();

    this.items[key].close();

    delete this.items[key];
    delete this.values[key];
    this.keys.splice(this.keys.indexOf(key), 1);

    this.flush();
  }

  onValue(key, item) {
    this.values[key] = item;
    this.flush();
  }

  flush() {
    for (const key of this.keys) {
      if (this.values[key] === noValue) {
        return;
      }
    }

    const value = this.keys.map(key => ({ ...this.values[key], [this.idField]: key }));
    this.emit('value', value);
  }

  close() {
    for (const key of this.keys) {
      this.items[key].close();
    }

    this.off('value');
    this.ref.off('child_added', this.onChildAdded);
    this.ref.off('child_removed', this.onChildRemoved);
  }

}
