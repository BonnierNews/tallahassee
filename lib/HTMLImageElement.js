"use strict";

const Element = require("./Element");

module.exports = class HTMLImageElement extends Element {
  constructor(document, $elm) {
    super(document, $elm);
  }
  get alt() {
    const value = this.getAttribute("alt");
    if (value === undefined) return "";
    return value;
  }
  set alt(val) {
    this.setAttribute("alt", val);
    return val;
  }
};
