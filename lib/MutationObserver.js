"use strict";

const assert = require("node:assert/strict");

const optionsByNodeSymbol = Symbol.for("optionsByNode");
const callbackSymbol = Symbol.for("callback");
const mutationTypes = [ "attributes", "childList" ];

class MutationObserver {
  constructor(callback) {
    this[callbackSymbol] = callback;
    this[optionsByNodeSymbol] = new Map();
    this._onMutation = this._onMutation.bind(this);
  }
  observe(targetNode, options) {
    this[optionsByNodeSymbol].set(targetNode, options);
    targetNode._emitter.on("_mutation", this._onMutation);
  }
  disconnect() {
    for (const node of this[optionsByNodeSymbol].keys()) {
      node._emitter.off("_mutation", this._onMutation);
    }
  }
  _onMutation(mutation, currentTarget) {
    const options = this[optionsByNodeSymbol].get(currentTarget);
    if (!options[mutation.type]) return;
    if (!options._internal && mutation.internal) return;
    if (!options.subtree && currentTarget !== mutation.target) return;

    return this[callbackSymbol].call(this, [ mutation ]);
  }
}

class Mutation {
  constructor(type, target, details = {}) {
    assert(mutationTypes.includes(type), `Unknown mutation type: ${type}`);
    Object.assign(this, details, {
      type,
      target,
    });
  }
}

module.exports = MutationObserver;
module.exports.Mutation = Mutation;
