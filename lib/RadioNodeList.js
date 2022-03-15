"use strict";

const NodeList = require("./NodeList");

module.exports = class RadioNodeList extends NodeList {
  constructor(parentElement, selector) {
    super(parentElement, selector, { attributes: true });

    Object.defineProperty(this, "value", {
      enumerable: true,
      get() {
        return parentElement.$elm.find("input:checked").attr("value");
      }
    });
  }
};
