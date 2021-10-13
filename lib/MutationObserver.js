"use strict";

const emitterSymbol = Symbol.for("emitter");

module.exports = function MutationObserver(callback) {
  let node;

  const observer = {
    disconnect,
    observe,
  };

  return observer;

  function disconnect() {
    if (!node) return;
    node[emitterSymbol].removeListener("_insert", onMutation);
    node[emitterSymbol].removeListener("_attributeChange", onAttributeChange);
    node = undefined;
  }

  function observe(targetNode, options) {
    node = targetNode;
    if (options.childList) {
      node[emitterSymbol].on("_insert", onMutation);
    }
    if (options.attributes) {
      node[emitterSymbol].on("_attributeChange", onAttributeChange);
    }
  }

  function onMutation() {
    return callback.call(observer, [MutationRecord("childList")]);
  }

  function onAttributeChange(attributeName, target) {
    return callback.call(observer, [MutationRecord("attributes", {attributeName, target})]);
  }

  function MutationRecord(type, record = {}) {
    return {type, ...record};
  }
};
