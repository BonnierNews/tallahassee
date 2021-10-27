"use strict";

const Element = require("./Element");
const {Event} = require("./Events");
const {RadioNodeList} = require("./NodeList");

module.exports = class HTMLFormElement extends Element {
  constructor(document, $elm) {
    super(document, $elm);
    const element = this;
    const nameHandler = {
      has(target, prop) {
        if (prop in target) return true;
        const result = Object.getOwnPropertyDescriptor(target, prop);
        if (result) return true;
        return !!element.$elm.find(`[name="${prop}"]`).length;
      },
      get(target, prop) {
        if (typeof prop === "symbol") return target[prop];
        const value = target[prop];
        if (value !== undefined) return value;

        const $namedElement = element.$elm.find(`[name="${prop}"]`).eq(0);
        if (!$namedElement) return;

        if ($namedElement.eq(0).attr("type") === "radio") return new RadioNodeList(element, `[name="${prop}"]`);
        return document._getElement($namedElement);
      }
    };

    return new Proxy(element, nameHandler);
  }
  get elements() {
    return this.$elm.find("input,button,select,textarea").map((_, e) => this.ownerDocument._getElement(this.ownerDocument.$(e))).toArray();
  }
  submit() {
    this.dispatchEvent(new Event("submit", { bubbles: true }));
  }
  reset() {
    const $inputs = this.$elm.find("input[type='checkbox']");
    if ($inputs.length) {
      $inputs.each((idx, elm) => {
        this.ownerDocument.$(elm).prop("checked", !!this.ownerDocument.$(elm).attr("checked"));
      });
    }

    const $options = this.$elm.find("option");
    if ($options.length) {
      $options.each((idx, elm) => {
        this.ownerDocument.$(elm).prop("selected", !!this.ownerDocument.$(elm).attr("selected"));
      });
    }

    this.dispatchEvent(new Event("reset", { bubbles: true }));
  }
};
