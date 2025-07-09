"use strict";

const { Event } = require("./Events");

const optionsByNodeSymbol = Symbol.for("optionsByNode");
const callbackSymbol = Symbol.for("callback");
const mutationTypes = [ "attributes", "childList" ];

class MutationObserver {
  constructor(callback) {
    this[callbackSymbol] = callback;
    this[optionsByNodeSymbol] = new Map();
    this._onAttributesMutationEvent = this._onAttributesMutationEvent.bind(this);
    this._onChildListMutationEvent = this._onChildListMutationEvent.bind(this);
    this._onMutation = this._onMutation.bind(this);
  }
  observe(targetNode, options) {
    this[optionsByNodeSymbol].set(targetNode, options);

    if (options.attributes) {
      targetNode._emitter.on("AttributesMutationEvent", this._onAttributesMutationEvent);
    }
    if (options.childList) {
      targetNode._emitter.on("ChildListMutationEvent", this._onChildListMutationEvent);
    }
  }
  disconnect() {
    for (const node of this[optionsByNodeSymbol].keys()) {
      node._emitter.off("AttributesMutationEvent", this._onAttributesMutationEvent);
      node._emitter.off("ChildListMutationEvent", this._onChildListMutationEvent);
    }
  }
  _onAttributesMutationEvent(mutation, ...path) {
    this._onMutation({
      currentTarget: path[0],
      target: path[path.length - 1],
      mutation: {
        ...mutation,
        type: "attributes",
        target: path[path.length - 1],
      },
    });
  }
  _onChildListMutationEvent(...path) {
    this._onMutation({
      currentTarget: path[0],
      target: path[path.length - 1],
      mutation: {
        type: "childList",
        target: path[path.length - 1],
      },
    });
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
