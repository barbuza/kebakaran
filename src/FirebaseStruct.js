import invariant from 'invariant';

import { Emitter } from './Emitter';
import { snapshotValue } from './snapshotValue';

const debug = require('debug')('kebakaran:FirebaseStruct');

const NO_VALUE = Symbol();

export class FirebaseStruct extends Emitter {

  constructor(fields) {
    invariant(fields, 'FirebaseStruct first arg is required');

    super();

    this.fields = fields;

    this.reset();
  }

  reset() {
    this.refs = [];
    this.data = Object.keys(this.fields).reduce((acc, key) => ({ ...acc, [key]: NO_VALUE }), {});
  }

  subscribe() {
    debug('subscribe');
    Object.keys(this.fields).forEach(name => {
      const ref = this.fields[name];
      const listener = snapshot => {
        this.setField(name, snapshotValue(snapshot));
      };
      this.refs.push({ ref, listener });
      ref.on('value', listener);
    });
  }

  setField(name, value) {
    debug('set field', name, value);
    this.data = { ...this.data, [name]: value };
    this.flush();
  }

  hasData() {
    for (const name in this.data) {
      if (this.data.hasOwnProperty(name)) {
        if (this.data[name] === NO_VALUE) {
          return false;
        }
      }
    }
    return true;
  }

  flush() {
    if (this.hasData()) {
      this.emit('value', this.data);
    }
  }

  close() {
    debug('close');
    for (const { ref, listener } of this.refs) {
      ref.off('value', listener);
    }
    this.reset();
  }

}

export function struct(fields) {
  return new FirebaseStruct(fields);
}
