import HTMLElement from "./HTMLElement.js";

export default class HTMLFieldSetElement extends HTMLElement {
  get form() {
    return this.closest("form");
  }
}
