"use strict";

const HTMLElement = require("./HTMLElement");

module.exports = class HTMLFieldSetElement extends HTMLElement {
  get form() {
    return this.closest("form");
  }
};
