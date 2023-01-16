"use strict";

const { PointerEvent } = require("./Events");
const Element = require("./Element");

module.exports = class HTMLButtonElement extends Element {
  get disabled() {
    return this.$elm.prop("disabled");
  }
  set disabled(value) {
    if (value === true) return this.setAttribute("disabled", "disabled");
    this.removeAttribute("disabled");
  }
  get value() {
    const value = this.getAttribute("value");
    if (value === undefined) return "";
    return value;
  }
  set value(val) {
    this.setAttribute("value", val);
    return val;
  }

  get type() {
    const type = this.getAttribute("type");
    switch (type) {
      case "submit":
      case "reset":
      case "button":
        return type;
      default:
        return "submit";
    }
  }
  click() {
    if (this.disabled) return;
    if (this.form) {
      const parentForm = this.closest("form");
      if (!parentForm || parentForm !== this.form) {
        const form = this.ownerDocument.getElementById(this.form.id);
        form.submit();
      }
    }
    const clickEvent = new PointerEvent("click", { bubbles: true });
    this.dispatchEvent(clickEvent);
  }
};
