"use strict";

const HTMLElement = require("./HTMLElement.js");

const documentSymbol = Symbol.for("document");

module.exports = class HTMLIFrameElement extends HTMLElement {
  constructor(document, $elm) {
    super(document, $elm);

    this[documentSymbol] = document;
  }

  get contentDocument() {
    return this[documentSymbol];
  }

  get contentWindow() {
    return this[documentSymbol].defaultView;
  }
};
