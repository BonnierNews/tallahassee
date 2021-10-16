"use strict";

const Element = require("./Element");

module.exports = class Select extends Element {
  get options() {
    return this.$elm.children("option").map((_, e) => this.ownerDocument._getElement(e)).toArray();
  }
  get selectedIndex() {
    return this.options.findIndex((option) => option.selected);
  }
  get selectedOptions() {
    return this.options?.filter((option) => option.selected);
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
};
