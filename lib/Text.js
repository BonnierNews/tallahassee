"use strict";

const Node = require("./Node.js");

module.exports = class Text extends Node {
  get textContent() {
    return this.$elm[0].data;
  }
  set textContent(value) {
    this.$elm[0].data = value;
    return value;
  }
  get nodeValue() {
    return this.textContent;
  }
  set nodeValue(value) {
    this.$elm[0].data = value;
    return value;
  }
};
