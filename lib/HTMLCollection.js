"use strict";

const NodeList = require("./NodeList.js");

module.exports = class HTMLCollection extends NodeList {
  constructor(parentElement, selector, options = { attributes: true, childList: true, subtree: true }, debug) {
    super(parentElement, selector, options, debug);

    Object.defineProperties(this, {
      item: { enumerable: true },
      namedItem: { enumerable: true },
    });
  }
};
