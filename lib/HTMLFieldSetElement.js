"use strict";

const HTMLElement = require("./HTMLElement.js");

module.exports = class HTMLFieldSetElement extends HTMLElement {
  get form() {
    return this.closest("form");
  }
  get disabled() {
    return this.$elm.prop("disabled");
  }
  set disabled(value) {
    if (value === true) return this.setAttribute("disabled", "disabled");
    this.removeAttribute("disabled");
  }
};
