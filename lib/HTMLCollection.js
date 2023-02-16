"use strict";

const NodeList = require("./NodeList.js");

module.exports = class HTMLCollection extends NodeList {
  constructor(parentElement, selector, options = { attributes: true }) {
    super(parentElement, selector, { ...options });

    Object.defineProperties(this, {
      item: { enumerable: true },
      namedItem: { enumerable: true },
    });
  }
};
