"use strict";

const HTMLElement = require("./HTMLElement.js");
const DocumentFragment = require("./DocumentFragment.js");

module.exports = class HTMLTemplateElement extends HTMLElement {
  get content() {
    return new DocumentFragment(this.ownerDocument, this);
  }
};
