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
  get value() {
    const value = this.getAttribute("value");
    if (value === undefined) return "";
    return value;
  }
  set value(val) {
    this.setAttribute("value", val);
    return val;
  }
};
