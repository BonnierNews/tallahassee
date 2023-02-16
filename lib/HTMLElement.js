"use strict";

const Element = require("./Element.js");
const DOMStringMap = require("./DOMStringMap.js");
const { Event } = require("./Events.js");

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

  get draggable() {
    return !!this.getAttribute("draggable");
  }

  set draggable(value) {
    this.getAttribute("draggable", !!value);
    return value;
  }
};
