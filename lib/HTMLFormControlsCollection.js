"use strict";

const HTMLCollection = require("./HTMLCollection");

module.exports = class HTMLFormControlsCollection extends HTMLCollection {
  constructor(parentElement, selector) {
    super(parentElement, selector, { childList: true, attributes: true });
  }
};
