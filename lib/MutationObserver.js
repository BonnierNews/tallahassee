"use strict";

module.exports = function MutationObserver(callback) {
  return {
    observe(targetNode) {
      targetNode._emitter.on("_insert", () => {
        return callback([{ type: "childList" }]);
      });
    }
  };
};
