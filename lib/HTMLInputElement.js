"use strict";

const { Event } = require("./Events");
const Element = require("./Element");

module.exports = class HTMLInputElement extends Element {
  get checked() {
    return this.$elm.prop("checked");
  }
  set checked(value) {
    const type = this.getAttribute("type");
    if (type === "checkbox") this.$elm.prop("checked", value);
    if (type !== "radio") return;

    const name = this.getAttribute("name");
    const $form = this.$elm.closest("form");
    if ($form && $form.length) {
      $form.find(`input[type="radio"][name="${name}"]`).removeAttr("checked");
    } else {
      this.ownerDocument.$(`input[type="radio"][name="${name}"]`).removeAttr("checked");
    }

    this.setAttribute("checked", value);
  }
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
    const type = this.type;

    let changed = false;
    if (type === "radio") {
      changed = !this.checked;
      this.checked = true;
    }

    if (type === "checkbox") {
      changed = true;
      this.checked = !this.checked;
    }

    this.dispatchEvent(clickEvent);

    if (clickEvent.defaultPrevented) return;

    if (changed) {
      this.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
};
