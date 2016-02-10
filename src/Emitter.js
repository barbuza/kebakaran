import invariant from 'invariant';
import EventEmitter from 'eventemitter3';

export class Emitter extends EventEmitter {

  subscribed = false;

  hasData() {
    /* istanbul ignore next */
    invariant(false, 'not implemented');
  }

  subscribe() {
    /* istanbul ignore next */
    invariant(false, 'not implemented');
  }

  close() {
    /* istanbul ignore next */
    invariant(false, 'not implemented');
  }

  subscribeIfNeeded() {
    if (!this.subscribed && this.listeners('value').length) {
      this.subscribed = true;
      this.subscribe();
    }
  }

  unsubscribeIfNeeded() {
    if (this.subscribed && this.listeners('value').length === 0) {
      this.subscribed = false;
      this.close();
    }
  }

  on(name, listener, context) {
    super.on(name, listener, context);
    if (name === 'value' && this.hasData()) {
      listener.call(context, this.data);
    }
    this.subscribeIfNeeded();
    return this;
  }

  off(name, listener, context, once) {
    super.removeListener(name, listener, context, once);
    this.unsubscribeIfNeeded();
    return this;
  }

  once(name, listener, context) {
    if (name === 'value' && this.hasData()) {
      listener.call(context, this.data);
    } else {
      super.once(name, listener, context);
      this.subscribeIfNeeded();
    }
    return this;
  }

  removeListener(name, listener, context, once) {
    return this.off(name, listener, context, once);
  }

  addListener() {
    /* istanbul ignore next */
    invariant(false, 'use .on() instead');
  }
}
