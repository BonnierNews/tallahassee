"use strict";

const MutationObserver = require("./MutationObserver");

module.exports = {
  NodeList,
  RadioNodeList
};

function NodeList(parentElement, selector, options = { attributes: true, getters: {} }) {
  const liveList = [];
  const document = parentElement.ownerDocument;

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
      if (result) return true;
      if (options.getters && options.getters[prop]) return true;
    },
    get(target, prop) {
      if (prop === "length") return liveList.length;
      if (prop === Symbol.isConcatSpreadable) return;
      if (typeof prop === "symbol") return liveList[prop];
      if (isIndex(prop)) return liveList[prop];
      if (options.getters && prop in options.getters) return options.getters[prop](target, prop);
    }
  };

  return new Proxy(this, ListHandler);

  function isIndex(name) {
    if (!/^[-]?\d+$/.test(name)) return undefined;
    return liveList[name];
  }

  function updateList(records) {
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
    const $nodes = selector !== undefined ? parentElement.$elm.find(selector) : parentElement.$elm.contents();
    const list = $nodes.map((_, elm) => document._getElement(document.$(elm))).toArray();

    liveList.length = 0;
    liveList.splice(0, -1, ...list);
  }

  function startObserver() {
    const observer = new MutationObserver(updateList);
    observer.observe(parentElement, {childList: true, attributes: true});
  }
}

NodeList.prototype.length = function length() {};

function RadioNodeList(parentElement, selector) {
  return new NodeList(parentElement, selector, {
    attributes: true,
    getters: {
      value() {
        return parentElement.$elm.find("input:checked").attr("value");
      },
    }
  });
}
