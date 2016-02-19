import invariant from 'invariant';
import isFunction from 'is-function';

import { Emitter } from './Emitter';
import { snapshotValue } from './snapshotValue';
import { isEmitter } from './isEmitter';

const debug = require('debug')('kebakaran:FirebaseStruct');

const NO_VALUE = Symbol();

const mapValueIdent = value => value;

export class FirebaseStruct extends Emitter {

  constructor(fields, mapValue = mapValueIdent) {
    Object.keys(fields).forEach(name =>
      invariant(isEmitter(fields[name]), 'FirebaseStruct fields values must be emitters')
    );

    invariant(isFunction(mapValue), 'FirebaseStruct second arg must be a function');

    super();

    this.fields = fields;
    this.mapValue = mapValue;

    this.reset();
  }

  reset() {
    this.refs = [];
    this.dataDirty = Object.keys(this.fields).reduce(
      (acc, key) => ({ ...acc, [key]: NO_VALUE }), {}
    );
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
    this.dataDirty = { ...this.dataDirty, [name]: value };
    this.flush();
  }

  get data() {
    return this.mapValue(this.dataDirty);
  }

  hasData() {
    for (const name in this.dataDirty) {
      if (this.dataDirty.hasOwnProperty(name)) {
        if (this.dataDirty[name] === NO_VALUE) {
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
