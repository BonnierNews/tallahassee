"use strict";

const vm = require("vm");

const HTMLElement = require("./HTMLElement.js");
const { ChildListMutationEvent } = require("./MutationObserver.js");

module.exports = class HTMLScriptElement extends HTMLElement {
  get textContent() {
    return this.$elm.html();
  }
  set textContent(value) {
    const response = this.$elm.html(value);
    this._emitter.emit("ChildListMutationEvent", this);
    return response;
  }
  _runScript() {
    return vm.runInNewContext(this.innerText, this.ownerDocument.defaultView);
  }
};
