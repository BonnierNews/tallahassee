"use strict";

const { Event } = require("./Events.js");
const HTMLElement = require("./HTMLElement.js");

module.exports = class HTMLDialogElement extends HTMLElement {
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
};
