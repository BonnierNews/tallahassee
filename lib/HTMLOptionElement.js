"use strict";

const HTMLElement = require("./HTMLElement.js");
const { Event } = require("./Events.js");
const { AttributesMutationEvent } = require("./MutationObserver.js");

module.exports = class HTMLOptionElement extends HTMLElement {
  get selected() {
    return this.$elm.prop("selected");
  }
  set selected(value) {
    const oldValue = this.$elm.prop("selected");
    const parent = this.parentElement;
    if (value && parent && !parent.multiple) {
      for (const opt of this.parentElement.children) {
        if (opt.tagName === "OPTION") {
          opt.$elm.prop("selected", opt === this);
        }
      }
    } else {
      this.$elm.prop("selected", value);
    }

    if (value !== oldValue) {
      console.log("set selected", value);
      this.dispatchEvent(new AttributesMutationEvent({ internal: true }));
      if (parent) parent.dispatchEvent(new Event("change", { bubbles: true }));
    }

    return value;
  }
  get value() {
    if (this.hasAttribute("value")) {
      return this.getAttribute("value");
    }
    return "";
  }
  set value(val) {
    this.setAttribute("value", val);
    return val;
  }
};
