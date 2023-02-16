"use strict";

const emptyString = "";

module.exports = function Storage() {
  const oStorage = { length: 0 };

  Object.defineProperty(oStorage, "getItem", {
    value(key) {
      return Object.hasOwnProperty.call(this, key) ? this[key] : null;
    },
  });

  Object.defineProperty(oStorage, "setItem", {
    value(key, value) {
      if (!key) return;
      this[key] = emptyString + value;
    },
  });

  Object.defineProperty(oStorage, "length", {
    get() {
      return Object.keys(this).length - 1;
    },
  });

  Object.defineProperty(oStorage, "removeItem", {
    value(key) {
      if (!key) return;
      delete this[key];
    },
  });

  Object.defineProperty(oStorage, "key", {
    value(index) {
      return Object.keys(oStorage).filter((p) => p !== "length")[index] || null;
    },
  });

  Object.defineProperty(oStorage, "clear", {
    value() {
      for (const key in this) {
        if (Object.hasOwnProperty.call(this, key)) delete this[key];
      }
      this.length = 0;
    },
  });

  this.value = oStorage;
  this.writable = true;
  this.configurable = true;
  this.enumerable = true;

  return oStorage;
};
