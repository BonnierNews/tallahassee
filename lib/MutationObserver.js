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
    node = undefined;
  }

  function observe(targetNode) {
    node = targetNode;
    node._emitter.on("_insert", onMutation);
  }

  function onMutation() {
    return callback.call(observer, [{ type: "childList" }]);
  }
};
