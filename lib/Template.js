"use strict";

const Element = require("./Element");

module.exports = class Template extends Element {
  get content() {
    const DocumentFragment = require("./DocumentFragment");
    return new DocumentFragment(this);
  }
};
