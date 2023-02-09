"use strict";

const { Event } = require("./Events");
const HTMLElement = require("./HTMLElement");
const HTMLCollection = require("./HTMLCollection");
const HtmlOptionCollection = require("./HTMLOptionsCollection");
const ValidityState = require("./ValidityState");

const kValidity = Symbol.for("validity");
const kValidationMessage = Symbol.for("validation message");
const kOptions = Symbol.for("options");
const kSelectedOptions = Symbol.for("selected options");

module.exports = class HTMLSelectElement extends HTMLElement {
  constructor(...args) {
    super(...args);

    this[kValidationMessage] = "";
    this[kValidity] = new ValidityState(this);
    this[kOptions] = new HtmlOptionCollection(this);
    this[kSelectedOptions] = new HTMLCollection(this, "> option", {
      childList: true,
      filter(_, $elm) {
        return $elm.prop("selected");
      },
    });
  }
  get disabled() {
    return this.$elm.prop("disabled");
  }
  set disabled(value) {
    if (value === true) return this.setAttribute("disabled", "disabled");
    this.removeAttribute("disabled");
  }
  get multiple() {
    return this.$elm.prop("multiple");
  }
  set multiple(val) {
    this.$elm.prop("multiple", !!val);
    return val;
  }
  get options() {
    return this[kOptions];
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
  get selectedIndex() {
    return this.options.selectedIndex;
  }
  set selectedIndex(val) {
    this.options.selectedIndex = val;
    return val;
  }
  get selectedOptions() {
    return this[kSelectedOptions];
  }
  get type() {
    return this.multiple ? "select-multiple" : "select-one";
  }
  get value() {
    const selectedIndex = this.selectedIndex;
    if (selectedIndex < 0) return "";
    const option = this.options[selectedIndex];
    if (option.hasAttribute("value")) {
      return option.getAttribute("value");
    }
    return option.innerText;
  }
  set value(val) {
    const options = this.options;
    const oldIdx = options.selectedIndex;
    for (let idx = 0; idx < options.length; idx++) {
      const option = options[idx];
      if (option.value === val || option.innerText === val) {
        options.selectedIndex = idx;
        if (oldIdx !== options.selectedIndex) {
          this.dispatchEvent(new Event("input"));
        }
        return val;
      }
    }
    return val;
  }
};
