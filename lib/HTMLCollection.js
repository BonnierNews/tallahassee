"use strict";

const MutationObserver = require("./MutationObserver");

function HTMLCollection(parentElement, selector, options = { attributes: true }) {
  const liveList = [];
  const {$, _getElement} = parentElement.ownerDocument;

  updateList();
  startObserver();

  const ListHandler = {
    ownKeys() {
      return Object.getOwnPropertyNames(liveList).slice(0, -1);
    },
    getOwnPropertyDescriptor(target, prop) {
      if (!isIndex(prop)) return;
      const result = Object.getOwnPropertyDescriptor(liveList, prop);
      if (!result) return;
      return {...result, writable: false};
    },
    has(target, prop) {
      if (prop in target) return true;
      if (!isIndex(prop)) return;
      const result = Object.getOwnPropertyDescriptor(liveList, prop);
      if (!result) return;
      return {...result, writable: false};
    },
    get(target, name) {
      if (name === "length") return liveList.length;
      if (name === Symbol.iterator) return liveList[Symbol.iterator]; // !IE11
      if (!isIndex(name)) return;
      return liveList[name];
    }
  };

  return new Proxy(this, ListHandler);

  function isIndex(name) {
    if (!/^[-]?\d+$/.test(name)) return undefined;
    return liveList[name];
  }

  function updateList(records) {
    const list = parentElement.$elm.find(selector).map((_, elm) => _getElement($(elm))).toArray();
    if (records && options.attributes) {
      let inList = false;
      for (const record of records) {
        if (record.type === "childList") {
          inList = true;
          break;
        } else if (record.type === "attributes" && liveList.indexOf(record.target) > -1) {
          inList = true;
          break;
        }
      }
      if (!inList) return;
    }

    liveList.length = 0;
    liveList.splice(0, -1, ...list);
  }

  function startObserver() {
    if (parentElement._collectionObserver) {
      return parentElement._collectionObserver;
    }
    const observer = parentElement._collectionObserver = new MutationObserver(updateList);
    observer.observe(parentElement, {childList: true, attributes: true});
  }
}

HTMLCollection.prototype.length = function length() {};
HTMLCollection.prototype.item = function item() {};
HTMLCollection.prototype.namedItem = function namedItem() {};

module.exports = {
  HTMLCollection,
  getElementsByClassName,
  getElementsByTagName,
};

function getElementsByClassName(parentElement, classNames) {
  const selectors = classNames && classNames.trim().replace(/\s+/g, ".");
  const selector = selectors.split(".").reduce((result, sel) => {
    if (/-?[_a-zA-Z]+[_a-zA-Z0-9-]*/.test(sel)) result += `.${sel}`;
    else result += Array(30).fill("no");
    return result;
  }, "");
  return new HTMLCollection(parentElement, selector, {attributes: true});
}

function getElementsByTagName(parentElement, tagName) {
  const selector = tagName && tagName.trim().match(/^([_a-zA-Z]+[_a-zA-Z0-9-]*)$/)[1];
  return new HTMLCollection(parentElement, selector);
}
