"use strict";

const Element = require("./Element");
const DOMStringMap = require("./DOMStringMap");

const datasetSymbol = Symbol.for("dataset");

module.exports = class HTMLElement extends Element {
  constructor(document, $elm) {
    super(document, $elm);

    this[datasetSymbol] = new DOMStringMap(this);
  }

  get dataset() {
    return this[datasetSymbol];
  }

  get contentEditable() {
    return this.hasAttribute("contenteditable") || false;
  }
};
