import HTMLElement from "./HTMLElement.js";

export default class HTMLLegendElement extends HTMLElement {
  get form() {
    return this.closest("form");
  }
}
