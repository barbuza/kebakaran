import EventEmitter from 'eventemitter3';

const noValue = Symbol();

export default class FirebaseStruct extends EventEmitter {

  refs = [];
  data = {};

  constructor(getFields, key) {
    super();

    this.getFields = getFields;
    this.key = key;

    this.subscribe();
  }

  on(name, listener, context) {
    super.on(name, listener, context);
    if (name === 'value' && this.hasData()) {
      listener.call(context, this.data);
    }
  }

  subscribe() {
    const fields = this.getFields(this.key);
    Object.keys(fields).forEach(name => {
      this.data[name] = noValue;
      const ref = fields[name];
      const listener = snapshot => {
        this.setField(name, snapshot.val());
      };
      ref.on('value', listener);
      this.refs.push({ ref, listener });
    });
  }

  setField(name, value) {
    this.data = { ...this.data, [name]: value };
    this.flush();
  }

  hasData() {
    for (const name in this.data) {
      if (this.data.hasOwnProperty(name)) {
        if (this.data[name] === noValue) {
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
    this.off('value');
    for (const { ref, listener } of this.refs) {
      ref.off('value', listener);
    }
  }

}
