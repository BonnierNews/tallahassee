"use strict";

const {NodeList} = require("./NodeList");

module.exports = {
  HTMLCollection,
  getElementsByClassName,
  getElementsByTagName,
};

function HTMLCollection(parentElement, selector, options = { attributes: true }) {
  const list = new NodeList(parentElement, selector, {
    ...options,
  });
  list.item = function item() {};
  list.namedItem = function item() {};

  Object.setPrototypeOf(list, HTMLCollection.prototype);

  return list;
}

HTMLCollection.prototype.length = function length() {};
HTMLCollection.prototype.item = function item() {};
HTMLCollection.prototype.namedItem = function namedItem() {};

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
