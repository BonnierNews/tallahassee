"use strict";

const Element = require("./Element");
const makeAbsolute = require("./makeAbsolute");

module.exports = class HTMLAnchorElement extends Element {
  get href() {
    const rel = this.getAttribute("href");
    return makeAbsolute(this.ownerDocument.location, rel);
  }
  set href(value) {
    return this.setAttribute("href", value);
  }
  toString() {
    return this.href;
  }
};
