import HTMLElement from "./HTMLElement.js";

const documentSymbol = Symbol.for("document");

export default class HTMLIFrameElement extends HTMLElement {
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
}
