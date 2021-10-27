"use strict";

const MutationObserver = require("./MutationObserver");

const elementSymbol = Symbol.for("element");
const selectorSymbol = Symbol.for("selector");
const liveListSymbol = Symbol.for("liveList");
const optionsSymbol = Symbol.for("options");

class ListHandler {
  constructor(liveList, getters) {
    this.liveList = liveList;
    this.getters = getters;
  }
  ownKeys() {
    return Object.getOwnPropertyNames(this.liveList).slice(0, -1);
  }
  getOwnPropertyDescriptor(target, prop) {
    if (!this.isIndex(prop)) return;
    const result = Object.getOwnPropertyDescriptor(this.liveList, prop);
    if (!result) return;
    return {...result, writable: false};
  }
  has(target, prop) {
    if (prop in target) return true;
    if (!this.isIndex(prop)) return;
    const result = Object.getOwnPropertyDescriptor(this.liveList, prop);
    if (result) return true;
    if (this.getters && this.getters[prop]) return true;
  }
  get(target, prop) {
    if (prop === "length") return this.liveList.length;
    if (prop === Symbol.isConcatSpreadable) return;
    if (typeof prop === "symbol") return this.liveList[prop];
    if (this.isIndex(prop)) return this.liveList[prop];
    if (this.getters && prop in this.getters) return this.getters[prop](target, prop);
  }
  isIndex(name) {
    if (!/^[-]?\d+$/.test(name)) return undefined;
    return this.liveList[name];
  }
}

class NodeList {
  constructor(parentElement, selector, options = { attributes: true, getters: {} }) {
    const liveList = this[liveListSymbol] = [];
    this[elementSymbol] = parentElement;
    this[selectorSymbol] = selector;
    this[optionsSymbol] = options;
    const observer = new MutationObserver(this._updateList.bind(this));
    observer.observe(parentElement, {childList: true, attributes: true});
    this._updateList();
    return new Proxy(this, new ListHandler(liveList, options.getters));
  }
  _updateList(records) {
    const liveList = this[liveListSymbol];
    if (records && this[optionsSymbol].attributes) {
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
    const element = this[elementSymbol];
    const selector = this[selectorSymbol];
    const $nodes = selector !== undefined ? element.$elm.find(selector) : element.$elm.contents();
    const list = $nodes.map((_, elm) => element.ownerDocument._getElement(elm)).toArray();

    liveList.length = 0;
    liveList.splice(0, -1, ...list);
  }
}

module.exports = {
  NodeList,
  RadioNodeList
};

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
