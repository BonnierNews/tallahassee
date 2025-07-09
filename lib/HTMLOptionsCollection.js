"use strict";

const NodeList = require("./NodeList.js");

const kSelectedIndex = Symbol.for("selected index");
const kLiveList = Symbol.for("liveList");

module.exports = class HTMLOptionCollection extends NodeList {
  constructor(parentElement) {
    super(parentElement, "> option", { childList: true });
    if (!this.length) this[kSelectedIndex] = -1;
    else this[kSelectedIndex] = parentElement.multiple ? -1 : 0;

    Object.defineProperty(this, "selectedIndex", {
      enumerable: true,
      get() {
        const list = this[kLiveList];
        for (let i = list.length - 1; i > -1; i--) {
          if (list[i].$elm.prop("selected") === true) return i;
        }
        return this[kSelectedIndex];
      },
      set(value) {
        let match;
        const list = this[kLiveList];
        for (let i = list.length - 1; i > -1; i--) {
          if (i === value) match = true;
          list[i].$elm.prop("selected", i === value);
        }
        if (!match) {
          this[kSelectedIndex] = -1;
          return this[kSelectedIndex];
        }
        return value;
      },
    });
  }
};
