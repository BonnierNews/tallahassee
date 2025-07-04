"use strict";

const { Event } = require("./Events");

const emitterSymbol = Symbol.for("emitter");
const optionsByNodeSymbol = Symbol.for("optionsByNode");
const callbackSymbol = Symbol.for("callback");

class MutationObserver {
  constructor(callback) {
    this[callbackSymbol] = callback;
    this[optionsByNodeSymbol] = new Map();
    this._onMutation = this._onMutation.bind(this);
    this._onAttributeChange = this._onAttributeChange.bind(this);
  }
  observe(targetNode, options) {
    this[optionsByNodeSymbol].set(targetNode, options);

    if (options.attributes) {
      targetNode.addEventListener("_attributeChange", this._onAttributeChange);
    }
    if (options.childList) {
      targetNode[emitterSymbol].on("_insert", this._onMutation);
    }
  }
  disconnect() {
    for (const node of this[optionsByNodeSymbol].keys()) {
      node[emitterSymbol].removeListener("_insert", this._onMutation);
      node.removeEventListener("_attributeChange", this._onAttributeChange);
    }
  }
  _onMutation() {
    return this[callbackSymbol].call(this, [
      mutationRecord("childList"),
    ]);
  }
  _onAttributeChange(event) {
    const { currentTarget, target, mutation } = event;
    const { subtree } = this[optionsByNodeSymbol].get(currentTarget);
    if (!subtree && currentTarget !== target) return;

    return this[callbackSymbol].call(this, [
      mutationRecord("attributes", mutation),
    ]);
  }
}

class AttributeChangeEvent extends Event {
  constructor(mutation) {
    super("_attributeChange", { bubbles: true });
    this.mutation = mutation;
  }
}

module.exports = MutationObserver;
module.exports.AttributeChangeEvent = AttributeChangeEvent;

function mutationRecord(type, mutation = {}) {
  return { type, ...mutation };
}
