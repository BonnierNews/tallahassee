"use strict";

const { InputEvent } = require("./Events");
const Element = require("./Element");

module.exports = class HTMLTextAreaElement extends Element {
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
  set innerHTML(value) {
    this.$elm.html(value);
    this.value = this.$elm.html();
    this._emitter.emit("_insert");
  }
  set innerText(value) {
    this.textContent = value;
    this.value = value;
  }
  get value() {
    const value = this.getAttribute("value");
    if (value === undefined) return "";
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
