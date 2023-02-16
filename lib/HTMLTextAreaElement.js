"use strict";

const { InputEvent } = require("./Events.js");
const HTMLElement = require("./HTMLElement.js");

module.exports = class HTMLTextAreaElement extends HTMLElement {
  get disabled() {
    return this.$elm.prop("disabled");
  }
  set disabled(value) {
    if (value === true) return this.setAttribute("disabled", "disabled");
    this.removeAttribute("disabled");
  }
  get readOnly() {
    return this.$elm.prop("readonly");
  }
  set readOnly(value) {
    if (value === true) return this.setAttribute("readonly", "readonly");
    this.removeAttribute("readonly");
  }
  get required() {
    return this.$elm.prop("required");
  }
  set required(value) {
    if (value === true) return this.setAttribute("required", "required");
    this.removeAttribute("required");
  }
  get value() {
    const value = this.getAttribute("value");
    if (value === null) return "";
    return value;
  }
  set value(val) {
    const oldVal = this.getAttribute("value");

    if (oldVal !== val) {
      this.setAttribute("value", val);
      this.dispatchEvent(new InputEvent("input"));
    }

    return val;
  }
};
