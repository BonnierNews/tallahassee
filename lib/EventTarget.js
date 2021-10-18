"use strict";

const Node = require("./Node");
const {EventEmitter} = require("events");

const emitterSymbol = Symbol.for("emitter");
const listenersSymbol = Symbol.for("listeners");

module.exports = class EventTarget extends Node {
  constructor(document, $elm) {
    super(document, $elm);
    const emitter = this[emitterSymbol] = new EventEmitter();
    emitter.setMaxListeners(0);
    this[listenersSymbol] = [];
  }
  get _emitter() {
    return this[emitterSymbol];
  }
  addEventListener(name, fn, options) {
    const self = this;
    const config = [name, fn, self._usesCapture(options), boundFn];
    const existingListenerIndex = self._getExistingIndex(...config);
    if (existingListenerIndex !== -1) return;

    self[listenersSymbol].push(config);
    self[emitterSymbol].on(name, boundFn);

    function boundFn(...args) {
      fn.apply(self, args);

      if (options && options.once) {
        self.removeEventListener(name, fn);
      }
    }
  }
  removeEventListener(name, fn, options) {
    const existingListenerIndex = this._getExistingIndex(name, fn, this._usesCapture(options));
    if (existingListenerIndex === -1) return;

    const listeners = this[listenersSymbol];
    const existingListener = listeners[existingListenerIndex];
    const boundFn = existingListener[3];

    this[emitterSymbol].removeListener(name, boundFn);
    listeners.splice(existingListenerIndex, 1);
  }
  dispatchEvent(event) {
    if (event.cancelBubble) return;
    event.path.push(this);
    if (!event.target) {
      event.target = this;
    }
    this[emitterSymbol].emit(event.type, event);
    if (event.bubbles) {
      if (this.parentElement) return this.parentElement.dispatchEvent(event);

      if (this.ownerDocument.firstElementChild === this) {
        this.ownerDocument.dispatchEvent(event);
      }
    }
  }
  _getExistingIndex(...config) {
    return this[listenersSymbol].findIndex((listener) => {
      return listener[0] === config[0]
        && listener[1] === config[1]
        && listener[2] === config[2];
    });
  }
  _usesCapture(options) {
    if (typeof options === "object") {
      return !!options.capture;
    }

    return !!options;
  }
};
