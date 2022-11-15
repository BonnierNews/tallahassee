"use strict";

const NodeList = require("./NodeList");

module.exports = class RadioNodeList extends NodeList {
  constructor(parentElement, name) {
    const selector = `input[type=radio][name="${name}"]`;
    super(parentElement, selector, { attributes: true });
  }
  get value() {
    for (const option of Array.from(this)) {
      if (option.disabled || !option.checked) continue;
      return option.value;
    }

    return "";
  }
};
