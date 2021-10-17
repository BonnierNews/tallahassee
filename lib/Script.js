"use strict";

const Element = require("./Element");
const vm = require("vm");

module.exports = class Script extends Element {
  get textContent() {
    return this.$elm.html();
  }
  set textContent(value) {
    const response = this.$elm.html(value);
    this._emitter.emit("_insert");
    return response;
  }
  _runScript() {
    return vm.runInNewContext(this.innerText, this.ownerDocument._window);
  }
};
