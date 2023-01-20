import Element from "./Element.js";
import DOMStringMap from "./DOMStringMap.js";
import { Event } from "./Events.js";

const datasetSymbol = Symbol.for("dataset");

export default class HTMLElement extends Element {
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

  get droppable() {
    return !!this.getAttribute("droppable");
  }

  set droppable(value) {
    this.getAttribute("droppable", !!value);
    return value;
  }
}
