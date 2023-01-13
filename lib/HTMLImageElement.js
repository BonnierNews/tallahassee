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
  get srcset() {
    const value = this.getAttribute("srcset");
    if (value === undefined) return "";
    return value;
  }
  set srcset(val) {
    this.setAttribute("srcset", val);
    return val;
  }
  get width() {
    const value = this.getAttribute("width");
    if (value === undefined) return 0;
    return parseInt(value, 10);
  }
  get height() {
    const value = this.getAttribute("height");
    if (value === undefined) return 0;
    return parseInt(value, 10);
  }
};
