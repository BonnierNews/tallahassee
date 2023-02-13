import vm from "vm";

import HTMLElement from "./HTMLElement.js";

export default class HTMLScriptElement extends HTMLElement {
  get textContent() {
    return this.$elm.html();
  }
  set textContent(value) {
    const response = this.$elm.html(value);
    this._emitter.emit("_insert");
    return response;
  }
  _runScript() {
    return vm.runInNewContext(this.innerText, this.ownerDocument.defaultView);
  }
}
