"use strict";

const DOMException = require("domexception");
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
    if (this.open) {
      throw new DOMException("Failed to execute 'showModal' on 'HTMLDialogElement': The element already has an 'open' attribute, and therefore cannot be opened modally.");
    }
    this.open = true;
  }
  show() {
    this.open = true;
  }
  close() {
    this.open = false;

    this.dispatchEvent(new Event("close"));
  }
};
