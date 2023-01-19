"use strict";

const HTMLElement = require("./HTMLElement");

module.exports = class HTMLTemplateElement extends HTMLElement {
  get content() {
    const DocumentFragment = require("./DocumentFragment");
    return new DocumentFragment(this.ownerDocument, this);
  }
};
