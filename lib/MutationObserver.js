"use strict";

const { Event } = require("./Events");

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

    for (const mutationType of mutationTypes) {
      if (!options[mutationType]) continue;
      targetNode.addEventListener(`_mutation:${mutationType}`, this._onMutation);
    }
  }
  disconnect() {
    for (const node of this[optionsByNodeSymbol].keys()) {
      for (const mutationType of mutationTypes) {
        node.removeEventListener(`_mutation:${mutationType}`, this._onMutation);
      }
    }
  }
  _onMutation(event) {
    const options = this[optionsByNodeSymbol].get(event.currentTarget);
    if (!options._internal && event.mutation.internal) return;
    if (!options.subtree && event.currentTarget !== event.target) return;

    return this[callbackSymbol].call(this, [ event.mutation ]);
  }
}

class MutationEvent extends Event {
  constructor(type, mutation = {}) {
    super(`_mutation:${type}`, { bubbles: true });
    const event = this;
    this.mutation = {
      ...mutation,
      type,
      get target() {
        return event.target;
      },
    };
  }
}

class AttributesMutationEvent extends MutationEvent {
  constructor(mutation) {
    super("attributes", mutation);
  }
}

class ChildListMutationEvent extends MutationEvent {
  constructor(mutation) {
    super("childList", mutation);
  }
}

module.exports = MutationObserver;
module.exports.AttributesMutationEvent = AttributesMutationEvent;
module.exports.ChildListMutationEvent = ChildListMutationEvent;
