"use strict";

const Element = require("./Element");
const {Event} = require("./Events");

module.exports = class HTMLOptionElement extends Element {
  get selected() {
    return this.$elm.prop("selected");
  }
  set selected(value) {
    const oldValue = this.$elm.prop("selected");
    const $select = this.$elm.parent("select");
    if (!$select.attr("multiple")) {
      if (value) this.$elm.siblings("option").prop("selected", false);
    }

    this.$elm.prop("selected", value);

    if (value !== oldValue) {
      this.ownerDocument._getElement($select).dispatchEvent(new Event("change", { bubbles: true }));
    }

    return value;
  }
  get value() {
    if (this.hasAttribute("value")) {
      return this.getAttribute("value");
    }
    return "";
  }
};
