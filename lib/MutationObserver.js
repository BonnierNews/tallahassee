"use strict";

module.exports = function MutationObserver(callback) {
  let node;

  const observer = {
    disconnect,
    observe
  };

  return observer;

  function disconnect() {
    if (!node) return;
    node._emitter.removeListener("_insert", onMutation);
    node._emitter.removeListener("_attributeChange", onAttributeChange);
    node = undefined;
  }

  function observe(targetNode, options) {
    node = targetNode;
    node._emitter.on("_insert", onMutation);
    if (options.attributes) {
      node._emitter.on("_attributeChange", onAttributeChange);
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
