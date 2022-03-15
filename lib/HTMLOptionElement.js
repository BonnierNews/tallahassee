"use strict";

const Element = require("./Element");
const {Event} = require("./Events");

module.exports = class HTMLOptionElement extends Element {
  get selected() {
    return this.$elm.prop("selected");
  }
  set selected(value) {
    const oldValue = this.$elm.prop("selected");
    const parent = this.parentElement;
    if (value && !parent.multiple) {
      for (const opt of this.parentElement.children) {
        if (opt.tagName === "OPTION") {
          opt.$elm.prop("selected", opt === this);
        }
      }
    } else {
      this.$elm.prop("selected", value);
    }

    if (value !== oldValue) {
      this._emitter.emit("_insert");
      parent.dispatchEvent(new Event("change", { bubbles: true }));
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
