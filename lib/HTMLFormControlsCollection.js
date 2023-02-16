"use strict";

const HTMLCollection = require("./HTMLCollection.js");
const RadioNodeList = require("./RadioNodeList.js");

module.exports = class HTMLFormControlsCollection extends HTMLCollection {
  constructor(parentElement, selector) {
    super(parentElement, selector, { childList: true, attributes: true });

    const element = this;

    return new Proxy(element, {
      has(target, prop) {
        if (prop in target) return true;
        if (Object.getOwnPropertyDescriptor(target, prop)) return true;
        if (typeof prop === "symbol") return !!target[prop];
        return !!element.querySelectorAll(`[name="${prop}"]`).length;
      },
      get(target, prop) {
        if (typeof prop === "symbol") return target[prop];
        const value = target[prop];
        if (value !== undefined) return value;

        const namedElement = parentElement.querySelector(`[name="${prop}"]`);
        if (!namedElement) return;

        if (namedElement.type === "radio") return new RadioNodeList(parentElement, prop);
        return namedElement;
      },
    });
  }
};
