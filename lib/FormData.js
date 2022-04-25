"use strict";

const kForm = Symbol.for("form");

module.exports = class FormData {
  constructor(form) {
    this[kForm] = form;
  }
  entries() {
    const result = [];
    for (const elm of this[kForm].elements) {
      result.push([ elm.name, elm.value ]);
    }
    return result[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.entries();
  }
};
