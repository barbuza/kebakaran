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

  subscribe() {
    const fields = this.getFields(this.key);
    Object.keys(fields).forEach(name => {
      this.data[name] = noValue;
      const ref = fields[name];
      const listener = ref.on('value', snapshot => {
        this.setField(name, snapshot.val());
      });
      this.refs.push({ ref, listener });
    });
  }

  setField(name, value) {
    this.data[name] = value;
    this.flush();
  }

  flush() {
    for (const name in this.data) {
      if (this.data.hasOwnProperty(name)) {
        if (this.data[name] === noValue) {
          return;
        }
      }
    }
    this.emit('value', this.data);
  }

  close() {
    this.off('value');
    for (const { ref, listener } of this.refs) {
      ref.off('value', listener);
    }
  }

}
