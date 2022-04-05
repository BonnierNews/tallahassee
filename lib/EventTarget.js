"use strict";

const {EventEmitter} = require("events");

const kEmitter = Symbol.for("emitter");
const kListeners = Symbol.for("listeners");

module.exports = class EventTarget {
  constructor() {
    const emitter = this[kEmitter] = new EventEmitter();
    emitter.setMaxListeners(0);
    this[kListeners] = [];
  }
  get _emitter() {
    return this[kEmitter];
  }
  addEventListener(name, fn, options) {
    const self = this;
    const config = [name, fn, usesCapture(options), boundFn];
    const existingListenerIndex = self._getExistingIndex(...config);
    if (existingListenerIndex !== -1) return;

    self[kListeners].push(config);
    self[kEmitter].on(name, boundFn);

    function boundFn(...args) {
      fn.apply(self, args);

      if (options && options.once) {
        self.removeEventListener(name, fn);
      }
    }
  }
  removeEventListener(name, fn, options) {
    const existingListenerIndex = this._getExistingIndex(name, fn, usesCapture(options));
    if (existingListenerIndex === -1) return;

    const listeners = this[kListeners];
    const existingListener = listeners[existingListenerIndex];
    const boundFn = existingListener[3];

    this[kEmitter].removeListener(name, boundFn);
    listeners.splice(existingListenerIndex, 1);
  }
  dispatchEvent(event) {
    if (event.cancelBubble) return;
    event.path.push(this);
    if (!event.target) {
      event.target = this;
    }

    const eventName = event.type;
    this[kEmitter].emit(eventName, event);
    const onevent = eventName[0] !== "_" && this[`on${event.type}`];
    if (onevent) onevent.call(this, event);

    if (event.bubbles && this.ownerDocument) {
      if (this.parentElement) return this.parentElement.dispatchEvent(event);

      if (this.ownerDocument.firstElementChild === this) {
        this.ownerDocument.dispatchEvent(event);
      }
    }
  }
  _getExistingIndex(...config) {
    return this[kListeners].findIndex((listener) => {
      return listener[0] === config[0]
        && listener[1] === config[1]
        && listener[2] === config[2];
    });
  }
};

function usesCapture(options) {
  if (typeof options === "object") {
    return !!options.capture;
  }

  return !!options;
}
