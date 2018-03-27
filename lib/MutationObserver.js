"use strict";

module.exports = function MutationObserver(callback) {
  return {
    observe(targetNode, config) {
      targetNode._emitter.on("_insert", () => {
        return callback([{ type: "childList" }]);
      });
    }
  };
};
