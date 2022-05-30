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
  get readOnly() {
    return this.$elm.prop("readonly");
  }
  set readOnly(value) {
    if (value === true) return this.setAttribute("readonly", "readonly");
    this.$elm.removeAttr("readonly");
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
  reportValidity() {
    if (this.getAttribute("required") || this.value.length > 0) {
      const attributes = [
        ["required", (val) => val.length > 0],
        ["min", (val, min) => val.length >= parseInt(min, 10)],
        ["max", (val, max) => val.length <= parseInt(max, 10)],
        ["pattern", (val, pattern) => new RegExp(`^(?:${pattern})$`).test(val)]
      ];

      return attributes.every(([key, processer]) => {
        return Object.keys(this.$elm.attr())
          .every((attr) => {
            if (key !== attr) return true;

            return processer(this.value, this.getAttribute(attr));
          });
      });
    }

    return true;
  }
};
