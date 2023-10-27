"use strict";

const { Event, InputEvent } = require("./Events.js");
const HTMLElement = require("./HTMLElement.js");
const ValidityState = require("./ValidityState.js");

const kValidity = Symbol.for("validity");
const kValidationMessage = Symbol.for("validation message");
module.exports = class HTMLTextAreaElement extends HTMLElement {
  constructor(...args) {
    super(...args);

    this[kValidationMessage] = "";
    this[kValidity] = new ValidityState(this);
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
  get required() {
    return this.$elm.prop("required");
  }
  set required(value) {
    if (value === true) return this.setAttribute("required", "required");
    this.removeAttribute("required");
  }
  get validationMessage() {
    return this[kValidationMessage];
  }
  get validity() {
    return this[kValidity];
  }
  get willValidate() {
    if (this.readOnly) return false;
    if (this.disabled) return false;
    return this.type !== "hidden";
  }
  reportValidity() {
    return this.checkValidity();
  }
  checkValidity() {
    const validity = this[kValidity];
    if (!validity.valid) this.dispatchEvent(new Event("invalid", { bubbles: true }));
    return validity.valid;
  }
  setCustomValidity(...args) {
    if (!args.length) throw new TypeError(`Failed to execute 'setCustomValidity' on '${this.constructor.name}': 1 argument required, but only 0 present.`);
    this[kValidationMessage] = `${args[0]}`;
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
      this.dispatchEvent(new InputEvent("change", { bubbles: true }));
    }

    return val;
  }
};
