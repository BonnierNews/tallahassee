"use strict";

const { PointerEvent } = require("./Events.js");
const HTMLElement = require("./HTMLElement.js");

module.exports = class HTMLButtonElement extends HTMLElement {
  constructor(document, $elm) {
    super(document, $elm);
    this.ownerDocument.addEventListener("click", (e) => {
      if (this.form && !e.defaultPrevented && e.target.type === "submit") {
        const parentForm = this.closest("form");
        if (!parentForm || parentForm !== this.form) {
          const form = this.ownerDocument.getElementById(this.form.id);
          form._submit(e);
        }
      }
    });
  }
  get disabled() {
    return this.$elm.prop("disabled");
  }
  set disabled(value) {
    if (value === true) return this.setAttribute("disabled", "disabled");
    this.removeAttribute("disabled");
  }
  get value() {
    const value = this.getAttribute("value");
    if (value === null) return "";
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

    const clickEvent = new PointerEvent("click", { bubbles: true });
    this.dispatchEvent(clickEvent);
  }
};
