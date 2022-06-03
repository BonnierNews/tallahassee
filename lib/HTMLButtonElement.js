"use strict";

const { Event } = require("./Events");
const Element = require("./Element");

module.exports = class HTMLButtonElement extends Element {
  get disabled() {
    return this.$elm.prop("disabled");
  }
  set disabled(value) {
    if (value === true) return this.setAttribute("disabled", "disabled");
    this.$elm.removeAttr("disabled");
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
  click() {
    if (this.disabled) return;
    const clickEvent = new Event("click", { bubbles: true });

    this.dispatchEvent(clickEvent);

    if (clickEvent.defaultPrevented) return;
    if (!this.form) return;

    if (!this.type || this.type === "submit") {
      const submitEvent = new Event("submit", { bubbles: true });
      submitEvent._submitElement = this;
      if (this.form.reportValidity()) {
        this.form.dispatchEvent(submitEvent);
      }
    } else if (this.type === "reset") {
      this.form.reset();
    }
  }
};
