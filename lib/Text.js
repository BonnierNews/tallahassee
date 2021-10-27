"use strict";

const Node = require("./Node");

module.exports = class Text extends Node {
  get textContent() {
    return this.$elm[0].data;
  }
  set textContent(value) {
    return this.$elm[0].data = value;
  }
  get nodeValue() {
    return this.textContent;
  }
};
