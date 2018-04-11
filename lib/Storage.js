"use strict";

module.exports = Storage;

function Storage() {
  const oStorage = {
    length: 0
  };

  Object.defineProperty(oStorage, "getItem", {
    value: function (key) {
      if (this.hasOwnProperty(key)) {
        return this[key];
      }
      return null;
    }
  });

  Object.defineProperty(oStorage, "setItem", {
    value: function (key, value) {
      this[key] = value;
    }
  });

  Object.defineProperty(oStorage, "length", {
    get: function () {
      return Object.keys(this).length - 1;
    }
  });

  Object.defineProperty(oStorage, "removeItem", {
    value: function (key) {
      if (!key) {
        return;
      }
      delete this[key];
    }
  });

  Object.defineProperty(oStorage, "clear", {
    value: function () {
      for (const key in this) {
        if (this.hasOwnProperty(key)) delete this[key];
      }
      this.length = 0;
    }
  });

  this.get = function () {
    return oStorage;
  };
}
