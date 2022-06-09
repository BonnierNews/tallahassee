"use strict";

const { Event } = require("./Events");
const Element = require("./Element");
const HTMLCollection = require("./HTMLCollection");
const HtmlOptionCollection = require("./HTMLOptionsCollection");

const kOptions = Symbol.for("options");
const kSelectedOptions = Symbol.for("selected options");

module.exports = class HTMLSelectElement extends Element {
  constructor(...args) {
    super(...args);
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
    this.$elm.removeAttr("disabled");
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
