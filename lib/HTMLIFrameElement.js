"use strict";

const Element = require("./Element");

const windowSymbol = Symbol.for("window");

module.exports = class HTMLIFrameElement extends Element {
  constructor(document, $elm) {
    super(document, $elm);

    this[windowSymbol] = document.defaultView;
  }

  get contentWindow() {
    return this[windowSymbol];
  }
};
