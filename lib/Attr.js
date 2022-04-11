"use strict";

const Node = require("./Node");

module.exports = class Attr extends Node {
  constructor(document, elm, name) {
    super(document, elm.$elm);

    this.elm = elm;
    this._name = name;
  }
  get name() {
    return this._name;
  }
  get value() {
    return this.elm.getAttribute(this._name);
  }
  set value(value) {
    this.elm.setAttribute(this._name, value);
    return value;
  }
};
