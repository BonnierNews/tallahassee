"use strict";

const MutationObserver = require("./MutationObserver.js");

const kElement = Symbol.for("element");
const kSelector = Symbol.for("selector");
const kLiveList = Symbol.for("liveList");
const kOptions = Symbol.for("options");

class ListHandler {
  constructor(liveList) {
    this.liveList = liveList;
  }
  ownKeys(target) {
    const keys = Object.getOwnPropertyNames(this.liveList).slice(0, -1);
    const targetKeys = Object.getOwnPropertyNames(target);
    return keys.concat(targetKeys);
  }
  getOwnPropertyDescriptor(target, prop) {
    const descr = Object.getOwnPropertyDescriptor(target, prop);
    if (descr) return descr;
    return Object.getOwnPropertyDescriptor(this.liveList, prop);
  }
  has(target, prop) {
    if (prop in target) return true;
    const result = Object.getOwnPropertyDescriptor(this.liveList, prop);
    if (result) return true;
    if (this.getters && this.getters[prop]) return true;
    return false;
  }
  get(target, prop) {
    if (prop === Symbol.isConcatSpreadable) return;
    if (prop in target) return target[prop];
    if (typeof prop === "symbol") return this.liveList[prop];
    if (this.isIndex(prop)) return this.liveList[prop];
  }
  isIndex(name) {
    if (typeof name !== "string") return undefined;
    if (!/^[-]?\d+$/.test(name)) return undefined;
    return this.liveList[name];
  }
}

module.exports = class NodeList {
  constructor(parentElement, selector, options = { attributes: true }) {
    const liveList = this[kLiveList] = [];
    this[kElement] = parentElement;
    this[kSelector] = selector;
    this[kOptions] = options;
    if (!options?.disconnected) {
      const observer = new MutationObserver(this._updateList.bind(this));
      console.log(parentElement.tagName, options);
      observer.observe(parentElement, options);
    }
    this._updateList();
    console.log("constructed", liveList.length);

    Object.defineProperty(this, "length", {
      enumerable: true,
      get() {
        return this[kLiveList].length;
      },
    });

    return new Proxy(this, new ListHandler(liveList));
  }
  toString() {
    return `[object ${this.constructor.name}]`;
  }
  _updateList(records) {
    const liveList = this[kLiveList];
    const { attributes, filter } = this[kOptions];
    console.log("update list", { liveList, attributes });
    if (records && attributes) {
      let inList = false;
      for (const record of records) {
        console.log(record);
        if (record.type === "childList") {
          console.log(1);
          inList = true;
          break;
        } else if (record.type === "attributes" && liveList.indexOf(record.target) > -1) {
          console.log(2);
          inList = true;
          break;
        } else {
          console.log(3);
        }
      }

      console.log("inList", inList);
      if (!inList) return;
    }
    const element = this[kElement];
    const selector = this[kSelector];
    let $nodes = selector !== undefined ? element.$elm.find(selector) : element.$elm.contents();
    if (filter) {
      $nodes = $nodes.filter((idx, el) => filter(idx, element.ownerDocument.$(el)));
    }
    const list = $nodes.map((_, elm) => element.ownerDocument._getElement(elm)).toArray();
    console.log("pre", liveList.length);
    liveList.length = 0;
    liveList.splice(0, -1, ...list);
    console.log("post", liveList.length);
  }
  [Symbol.iterator]() {
    return this[kLiveList][Symbol.iterator]();
  }
};
