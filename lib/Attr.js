"use strict";

const Node = require("./Node");

const kElm = Symbol.for("element");
const kName = Symbol.for("name");

module.exports = class Attr extends Node {
  constructor(document, elm, name) {
    super(document, elm.$elm);

    this[kElm] = elm;
    this[kName] = name;
  }
  get name() {
    return this[kName];
  }
  get value() {
    return this[kElm].getAttribute(this[kName]);
  }
  set value(value) {
    this[kElm].setAttribute(this[kName], value);
    return value;
  }
};
