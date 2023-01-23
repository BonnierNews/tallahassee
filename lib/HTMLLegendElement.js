"use strict";

const HTMLElement = require("./HTMLElement");

module.exports = class HTMLLegendElement extends HTMLElement {
  get form() {
    return this.closest("form");
  }
};
