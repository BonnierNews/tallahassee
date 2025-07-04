"use strict";

const { Event } = require("./Events");

const optionsByNodeSymbol = Symbol.for("optionsByNode");
const callbackSymbol = Symbol.for("callback");

class MutationObserver {
  constructor(callback) {
    this[callbackSymbol] = callback;
    this[optionsByNodeSymbol] = new Map();
    this._onMutation = this._onMutation.bind(this);
  }
  observe(targetNode, options) {
    this[optionsByNodeSymbol].set(targetNode, options);

    if (options.attributes) {
      targetNode.addEventListener("_attributeChange", this._onMutation);
    }
    if (options.childList) {
      targetNode.addEventListener("_insert", this._onMutation);
    }
  }
  disconnect() {
    for (const node of this[optionsByNodeSymbol].keys()) {
      node.removeEventListener("_attributeChange", this._onMutation);
      node.removeEventListener("_insert", this._onMutation);
    }
  }
  _onMutation(event) {
    const { currentTarget, target, mutation } = event;
    const { subtree } = this[optionsByNodeSymbol].get(currentTarget);
    if (!subtree && currentTarget !== target) return;

    return this[callbackSymbol].call(this, [
      mutation,
    ]);
  }
}

class AttributeChangeEvent extends Event {
  constructor(mutation) {
    super("_attributeChange", { bubbles: true });
    this.mutation = {
      ...mutation,
      type: "attributes",
    };
  }
}

class InsertEvent extends Event {
  constructor(mutation) {
    super("_insert", { bubbles: true });
    this.mutation = {
      ...mutation,
      type: "childList",
    };
  }
}

module.exports = MutationObserver;
module.exports.AttributeChangeEvent = AttributeChangeEvent;
module.exports.InsertEvent = InsertEvent;
