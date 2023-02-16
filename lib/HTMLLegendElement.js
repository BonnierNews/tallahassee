"use strict";

const HTMLElement = require("./HTMLElement.js");

module.exports = class HTMLLegendElement extends HTMLElement {
  get form() {
    return this.closest("form");
  }
};
