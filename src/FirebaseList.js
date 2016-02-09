import EventEmitter from 'eventemitter3';

import { FirebaseStruct } from './FirebaseStruct';

const NO_VALUE = Symbol();

export class FirebaseList extends EventEmitter {

  keys = [];
  items = {};
  values = {};

  constructor(ref, getFields, idField = 'id', instant = false) {
    super();

    this.ref = ref;
    this.getFields = getFields;
    this.idField = idField;
    this.instant = instant;
    this.hasInitialData = !instant;

    this.subscribe();
  }

  subscribe() {
    if (this.instant) {
      this.onValue = ::this.onValue;
      this.ref.on('value', this.onValue);
    } else {
      this.onChildAdded = ::this.onChildAdded;
      this.onChildRemoved = ::this.onChildRemoved;
      this.ref.on('child_added', this.onChildAdded);
      this.ref.on('child_removed', this.onChildRemoved);
    }
  }

  on(name, listener, context) {
    super.on(name, listener, context);
    if (name === 'value' && this.hasData()) {
      listener.call(context, this.data);
    }
  }

  onValue(snapshot) {
    const newKeys = [];
    snapshot.forEach(itemSnapshot => {
      newKeys.push(itemSnapshot.key());
    });
    for (const key of newKeys) {
      if (this.keys.indexOf(key) === -1) {
        this.addChild(key);
      }
    }
    for (const key of this.keys) {
      if (newKeys.indexOf(key) === -1) {
        this.removeChild(key);
      }
    }
    this.keys = newKeys;
    this.hasInitialData = true;
    this.flush();
  }

  onChildAdded(c) {
    const key = c.key();
    this.addChild(key);
  }

  onChildRemoved(c) {
    const key = c.key();
    this.removeChild(key);
    this.flush();
  }

  addChild(key) {
    const item = new FirebaseStruct(this.getFields, key);

    this.values[key] = NO_VALUE;
    this.keys.push(key);
    this.items[key] = item;

    item.on('value', value => {
      this.onItemValue(key, value);
    });
  }

  removeChild(key) {
    this.items[key].close();

    delete this.items[key];
    delete this.values[key];
    this.keys.splice(this.keys.indexOf(key), 1);
  }

  onItemValue(key, item) {
    this.values[key] = item;
    this.flush();
  }

  hasData() {
    if (!this.hasInitialData) {
      return false;
    }
    for (const key of this.keys) {
      if (this.values[key] === NO_VALUE) {
        return false;
      }
    }
    return true;
  }

  get data() {
    return this.keys.map(key => ({ ...this.values[key], [this.idField]: key }));
  }

  flush() {
    if (this.hasData()) {
      this.emit('value', this.data);
    }
  }

  close() {
    for (const key of this.keys) {
      this.items[key].close();
    }

    this.off('value');

    if (this.instant) {
      this.ref.off('value', this.onValue);
    } else {
      this.ref.off('child_added', this.onChildAdded);
      this.ref.off('child_removed', this.onChildRemoved);
    }
  }

}
