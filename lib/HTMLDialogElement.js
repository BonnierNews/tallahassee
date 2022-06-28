"use strict";

const { Event } = require("./Events");
const Element = require("./Element");

module.exports = class HTMLDialogElement extends Element {
  constructor(document, $elm) {
    super(document, $elm);

    document.addEventListener("keypress", (evt) => {
      if (evt.keyCode !== 27) return;

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
};
