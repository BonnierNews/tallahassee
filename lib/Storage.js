"use strict";

module.exports = Storage;

function Storage() {
  const oStorage = {
    length: 0
  };

  Object.defineProperty(oStorage, "getItem", {
    value(key) {
      return this.hasOwnProperty(key) ? this[key] : null;
    }
  });

  Object.defineProperty(oStorage, "setItem", {
    value(key, value) {
      if (!key) return;
      this[key] = value;
    }
  });

  Object.defineProperty(oStorage, "length", {
    get() {
      return Object.keys(this).length - 1;
    }
  });

  Object.defineProperty(oStorage, "removeItem", {
    value(key) {
      if (!key) return;
      delete this[key];
    }
  });

  Object.defineProperty(oStorage, "clear", {
    value() {
      for (const key in this) {
        if (this.hasOwnProperty(key)) delete this[key];
      }
      this.length = 0;
    }
  });

  this.value = oStorage;
  this.writable = true;
  this.configurable = true;
  this.enumerable = true;

  return oStorage;
}
