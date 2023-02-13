import HTMLElement from "./HTMLElement.js";
import DocumentFragment from "./DocumentFragment.js";

export default class HTMLTemplateElement extends HTMLElement {
  get content() {
    return new DocumentFragment(this.ownerDocument, this);
  }
}
