"use strict";

const { Event } = require("./Events");
const Element = require("./Element");
const HTMLFormControlsCollection = require("./HTMLFormControlsCollection");
const RadioNodeList = require("./RadioNodeList");
const HTMLInputElement = require("./HTMLInputElement");

const originSymbol = Symbol.for("origin");

module.exports = class HTMLFormElement extends Element {
  constructor(document, $elm) {
    super(document, $elm);
    const element = this;
    const nameHandler = {
      has(target, prop) {
        if (prop in target) return true;
        if (Object.getOwnPropertyDescriptor(target, prop)) return true;
        if (typeof prop === "symbol") return !!target[prop];
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

    this[originSymbol] = document.location.href;

    return new Proxy(element, nameHandler);
  }
  get elements() {
    return new HTMLFormControlsCollection(this, "input[type!=image],button,select,textarea,fieldset,object,output");
  }
  get method() {
    return (this.getAttribute("method") || "get").toLowerCase();
  }
  set method(val) {
    if (typeof val === "string") {
      const method = val.toLowerCase();
      this.setAttribute("method", method);
    }
    return val;
  }
  get action() {
    return this.getAttribute("action") || this[originSymbol];
  }
  set action(val) {
    this.setAttribute("action", val);
    return val;
  }
  submit() {
    this.dispatchEvent(new Event("_form_submit", { bubbles: true }));
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
  reportValidity() {
    return [...this.elements].every((el) => {
      if (el instanceof HTMLInputElement) {
        return el.reportValidity();
      }
      return true;
    });
  }
};
