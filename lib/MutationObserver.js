"use strict";

const assert = require("node:assert/strict");

const optionsListByNodeSymbol = Symbol.for("optionsListByNode");
const callbackSymbol = Symbol.for("callback");
const mutationTypes = [ "attributes", "childList" ];

class MutationObserver {
  constructor(callback) {
    this[callbackSymbol] = callback;
    this[optionsListByNodeSymbol] = new Map();
    this._onMutation = this._onMutation.bind(this);
  }
  observe(targetNode, options) {
    const optionsListByNode = this[optionsListByNodeSymbol];
    if (optionsListByNode.has(targetNode)) {
      optionsListByNode.get(targetNode).push(options);
      return;
    }

    optionsListByNode.set(targetNode, [ options ]);
    targetNode._emitter.on("_mutation", this._onMutation);
  }
  disconnect() {
    for (const node of this[optionsListByNodeSymbol].keys()) {
      node._emitter.off("_mutation", this._onMutation);
    }

    this[optionsListByNodeSymbol].clear();
  }
  _onMutation(mutation, currentTarget) {
    for (const options of this[optionsListByNodeSymbol].get(currentTarget)) {
      if (!options[mutation.type]) continue;
      if (!options._internal && mutation.internal) continue;
      if (!options.subtree && currentTarget !== mutation.target) continue;

      this[callbackSymbol].call(this, [ mutation ]);
    }
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
