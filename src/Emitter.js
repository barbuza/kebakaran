import invariant from 'invariant';
import EventEmitter from 'eventemitter3';

export class Emitter extends EventEmitter {

  subscribed = false;

  hasData() {
    /* istanbul ignore next */
    invariant('not implemented');
  }

  subscribe() {
    /* istanbul ignore next */
    invariant('not implemented');
  }

  close() {
    /* istanbul ignore next */
    invariant('not implemented');
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
  }

  off(name, listener, context, once) {
    this.removeListener(name, listener, context, once);
  }

  removeListener(name, listener, context, once) {
    super.removeListener(name, listener, context, once);
    this.unsubscribeIfNeeded();
  }

  once(name, listener, context) {
    if (name === 'value' && this.hasData()) {
      listener.call(context, this.data);
      return;
    }
    super.once(name, listener, context);
    this.subscribeIfNeeded();
  }

}
