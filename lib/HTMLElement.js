"use strict";

const Element = require("./Element");
const DOMStringMap = require("./DOMStringMap");
const { Event } = require("./Events");

const datasetSymbol = Symbol.for("dataset");

module.exports = class HTMLElement extends Element {
  constructor(document, $elm) {
    super(document, $elm);

    this[datasetSymbol] = new DOMStringMap(this);
  }

  focus() {
    if (this.disabled) return;
    const focusEvent = new Event("focus", { bubbles: true });
    this.dispatchEvent(focusEvent);
  }

  blur() {
    const focusEvent = new Event("blur", { bubbles: true });
    this.dispatchEvent(focusEvent);
  }

  get dataset() {
    return this[datasetSymbol];
  }

  get contentEditable() {
    return this.hasAttribute("contenteditable") || false;
  }
};
