"use strict";

const Element = require("./Element");

const winSymbol = Symbol.for("window");

module.exports = class HTMLIFrameElement extends Element {
  constructor(document, $elm) {
    super(document, $elm);

    this[winSymbol] = document.defaultView;
  }

  get contentWindow() {
    return this[winSymbol];
  }
};
