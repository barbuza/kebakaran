import invariant from 'invariant';
import isFunction from 'is-function';

import { Emitter } from './Emitter';
import { snapshotValue } from './snapshotValue';

const debug = require('debug')('kebakaran:FirebaseList');

const NO_VALUE = Symbol();

const getKey = snapshot => snapshot.key();

export class FirebaseList extends Emitter {

  constructor(ref, mapChild, { idField = 'id', instant = true, mapKey = getKey } = {}) {
    invariant(ref, 'FirebaseList first arg is required');
    invariant(isFunction(mapChild), 'FirebaseList second arg must be a function');
    invariant(isFunction(mapKey), 'FirebaseList `mapKey` option must be a function');

    super();

    this.ref = ref;
    this.mapChild = mapChild;
    this.idField = idField;
    this.instant = instant;
    this.hasInitialData = !instant;
    this.mapKey = mapKey;

    this.reset();
  }

  reset() {
    this.keys = [];
    this.items = {};
    this.values = {};
  }

  subscribe() {
    if (this.instant) {
      debug('subscribe instant');
      this.ref.on('value', this.onValue, this);
    } else {
      debug('subscribe');
      this.ref.on('child_added', this.onChildAdded, this);
      this.ref.on('child_removed', this.onChildRemoved, this);
    }
  }

  onValue(snapshot) {
    const newKeys = [];
    snapshot.forEach(itemSnapshot => {
      newKeys.push(this.mapKey(itemSnapshot));
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
    const key = this.mapKey(c);
    this.addChild(key);
  }

  onChildRemoved(c) {
    const key = this.mapKey(c);
    this.removeChild(key);
    this.flush();
  }

  addChild(key) {
    const item = this.mapChild(key);

    this.values[key] = NO_VALUE;
    this.keys.push(key);

    const listener = value => {
      this.onItemValue(key, snapshotValue(value));
    };

    this.items[key] = { item, listener };

    item.on('value', listener);
  }

  removeChild(key) {
    const { item, listener } = this.items[key];
    item.off('value', listener);

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
    debug('close');

    for (const key of this.keys) {
      const { item, listener } = this.items[key];
      item.off('value', listener);
    }

    if (this.instant) {
      this.ref.off('value', this.onValue, this);
    } else {
      this.ref.off('child_added', this.onChildAdded, this);
      this.ref.off('child_removed', this.onChildRemoved, this);
    }

    this.reset();
  }

}

export function list(ref, mapChild, options) {
  return new FirebaseList(ref, mapChild, options);
}
