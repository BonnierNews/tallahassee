"use strict";

const Element = require("./Element.js");
const DOMStringMap = require("./DOMStringMap.js");
const { FocusEvent, PointerEvent } = require("./Events.js");

const documentSymbol = Symbol.for("document");
const datasetSymbol = Symbol.for("dataset");

module.exports = class HTMLElement extends Element {
  constructor(document, $elm) {
    super(document, $elm);

    this[documentSymbol] = document;
    this[datasetSymbol] = new DOMStringMap(this);
  }

  focus() {
    if (this.disabled) return;
    const doc = this[documentSymbol];
    if (doc.activeElement !== this && doc.activeElement !== doc.body) {
      doc.activeElement.blur(this);
    }
    doc._setActiveElement(this);
    const focusEvent = new FocusEvent("focus", { bubbles: false });
    this.dispatchEvent(focusEvent);
  }

  blur(relatedTarget = null) {
    this[documentSymbol]._setActiveElement(null);
    const focusEvent = new FocusEvent("blur", { bubbles: false, relatedTarget });
    this.dispatchEvent(focusEvent);
  }

  click() {
    if (this.nodeName === "SUMMARY") {
      this.closest("details").open = !this.closest("details").open;
    }
    const doc = this[documentSymbol];
    if (doc.activeElement !== this && doc.activeElement !== doc.body) {
      doc.activeElement.blur(this);
    }
    this.dispatchEvent(new PointerEvent("click", { bubbles: true, cancelable: true }));
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
