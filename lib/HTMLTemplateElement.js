"use strict";

const Element = require("./Element");

module.exports = class HTMLTemplateElement extends Element {
  get content() {
    const DocumentFragment = require("./DocumentFragment");
    return new DocumentFragment(this);
  }
};
