"use strict";

module.exports = function MutationObserver(callback) {
  return {
    observe(targetNode, config) {
      observeNode(targetNode, config);
    }
  };

  function observeNode(node, config) {
    let oldFunction = node.appendChild;
    node.appendChild = function () {
      oldFunction.apply(this, arguments);
      return callback([{ type: "childList" }]);
    };

    oldFunction = node.insertAdjacentHTML;
    node.insertAdjacentHTML = function () {
      oldFunction.apply(this, arguments);
      if (arguments[0] === "beforeend" || arguments[0] === "afterbegin") {
        return callback([{ type: "childList" }]);
      }
    };

    node.children.forEach((child) => observeNode(child, config, callback));
  }
};
