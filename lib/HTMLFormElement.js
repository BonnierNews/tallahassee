"use strict";

const { Event, SubmitEvent, symbols } = require("./Events.js");
const HTMLElement = require("./HTMLElement.js");
const HTMLFormControlsCollection = require("./HTMLFormControlsCollection.js");
const HTMLInputElement = require("./HTMLInputElement.js");
const HTMLSelectElement = require("./HTMLSelectElement.js");
const HTMLTextAreaElement = require("./HTMLTextAreaElement.js");

const originSymbol = Symbol.for("origin");

module.exports = class HTMLFormElement extends HTMLElement {
  constructor(document, $elm) {
    super(document, $elm);

    this[originSymbol] = document.location.href;
  }
  get elements() {
    return new HTMLFormControlsCollection(this, "input[type!=image],button,select,textarea,fieldset,object,output");
  }
  get method() {
    return (this.getAttribute("method") || "get").toLowerCase();
  }
  set method(val) {
    const validMethods = [ "get", "post" ];
    if (typeof val === "string" && validMethods.includes(val.toLowerCase())) {
      const method = val.toLowerCase();
      this.setAttribute("method", method);
    } else {
      this.setAttribute("method", "get");
    }

    return val;
  }
  get noValidate() {
    return this.hasAttribute("novalidate");
  }
  set noValidate(val) {
    if (val) {
      return this.setAttribute("novalidate", "novalidate");
    } else {
      return this.removeAttribute("novalidate");
    }
  }
  get action() {
    return this.getAttribute("action") || this[originSymbol];
  }
  set action(val) {
    this.setAttribute("action", val);
    return val;
  }
  get enctype() {
    return this.getAttribute("enctype") || "application/x-www-form-urlencoded";
  }
  dispatchEvent(event) {
    super.dispatchEvent(event);
    const target = event.target;
    if (!target || target === this || event.type !== "click") return;

    if (target.type === "submit") {
      this._submit(event);
    } else if (target.type === "reset") {
      this.reset();
    }
  }

  _submit(sourceEvent) {
    if (!this.noValidate && !this.reportValidity()) return;
    const submitEvent = new SubmitEvent("submit");
    submitEvent[symbols.submitter] = sourceEvent.target;
    super.dispatchEvent(submitEvent);
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
    return [ ...this.elements ]
      .map((el) => {
        if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
          return el.reportValidity();
        }
        return true;
      })
      .every(Boolean);
  }
};
