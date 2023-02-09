import { Event } from "./Events.js";
import HTMLElement from "./HTMLElement.js";

export default class HTMLDialogElement extends HTMLElement {
  constructor(document, $elm) {
    super(document, $elm);

    document.addEventListener("keypress", (evt) => {
      if (evt.keyCode !== 27) return;

      this.open = false;
      this.dispatchEvent(new Event("cancel"));
    });
  }
  showModal() {
    this.open = true;
  }
  close() {
    this.open = false;

    this.dispatchEvent(new Event("close"));
  }
}
