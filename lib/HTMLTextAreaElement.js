"use strict";

const Element = require("./Element");

module.exports = class HTMLTextAreaElement extends Element {
  set innerHTML(value) {
    this.$elm.html(value);
    this.value = this.$elm.html();
    this._emitter.emit("_insert");
  }
  set innerText(value) {
    this.textContent = value;
    this.value = value;
  }
};
