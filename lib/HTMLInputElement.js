"use strict";

const { Event, InputEvent, PointerEvent } = require("./Events");
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
    this.removeAttribute("disabled");
  }
  get readOnly() {
    return this.$elm.prop("readonly");
  }
  set readOnly(value) {
    if (value === true) return this.setAttribute("readonly", "readonly");
    this.removeAttribute("readonly");
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

      const event = ["text", "email", "tel", "number"].includes(this.type) ?
        new InputEvent("input") :
        new Event("input");
      this.dispatchEvent(event);
    }

    return val;
  }
  click() {
    if (this.disabled) return;
    const clickEvent = new PointerEvent("click", { bubbles: true });
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
  reportValidity() {
    if (this.getAttribute("required") || this.value.length > 0) {
      const attributes = [
        ["required", (val) => val.length > 0],
        ["min", (val, min) => val.length >= parseInt(min, 10)],
        ["max", (val, max) => val.length <= parseInt(max, 10)],
        ["pattern", (val, pattern) => new RegExp(`^(?:${pattern})$`).test(val)]
      ];

      return attributes
        .every(([key, processer]) => {
          const attrVal = this.$elm.attr(key);
          if (attrVal === undefined) return true;

          const valid = processer(this.value, attrVal);
          if (!valid) this.dispatchEvent(new Event("invalid"));
          return valid;
        });
    }

    return true;
  }
};
