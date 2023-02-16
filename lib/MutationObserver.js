"use strict";

const emitterSymbol = Symbol.for("emitter");
const nodeSymbol = Symbol.for("node");
const callbackSymbol = Symbol.for("callback");

module.exports = class MutationObserver {
  constructor(callback) {
    this[callbackSymbol] = callback;
    this._onMutation = this._onMutation.bind(this);
    this._onAttributeChange = this._onAttributeChange.bind(this);
  }
  observe(targetNode, options) {
    this[nodeSymbol] = targetNode;
    if (options.childList) {
      targetNode[emitterSymbol].on("_insert", this._onMutation);
    }
    if (options.attributes) {
      targetNode[emitterSymbol].on("_attributeChange", this._onAttributeChange);
    }
  }
  disconnect() {
    const node = this[nodeSymbol];
    if (!node) return;
    this[nodeSymbol] = undefined;
    node[emitterSymbol].removeListener("_insert", this._onMutation);
    node[emitterSymbol].removeListener("_attributeChange", this._onAttributeChange);
  }
  _onMutation() {
    return this[callbackSymbol].call(this, [ mutationRecord("childList") ]);
  }
  _onAttributeChange(attributeName, target) {
    return this[callbackSymbol].call(this, [ mutationRecord("attributes", { attributeName, target }) ]);
  }
};

function mutationRecord(type, record = {}) {
  return { type, ...record };
}
