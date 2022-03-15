"use strict";

const {NodeList} = require("./NodeList");

class HTMLCollection extends NodeList {
  constructor(parentElement, selector, options = { attributes: true }) {
    super(parentElement, selector, { ...options });

    Object.defineProperties(this, {
      item: {
        enumerable: true,
      },
      namedItem: {
        enumerable: true,
      },
    });
  }
}

module.exports = {
  HTMLCollection,
  getElementsByClassName,
  getElementsByTagName,
};

function getElementsByClassName(parentElement, classNames) {
  const selectors = classNames && classNames.trim().replace(/\s+/g, ".");
  const noMatch = Array(30).fill("no").join("");
  const selector = selectors.split(".").reduce((result, sel) => {
    if (/-?[_a-zA-Z]+[_a-zA-Z0-9-]*/.test(sel)) result += `.${sel}`;
    else result += noMatch;
    return result;
  }, "");
  return new HTMLCollection(parentElement, selector, {attributes: true});
}

function getElementsByTagName(parentElement, tagName) {
  const selector = tagName && tagName.trim().match(/^([_a-zA-Z]+[_a-zA-Z0-9-]*)$/)[1];
  return new HTMLCollection(parentElement, selector, {attributes: false});
}
