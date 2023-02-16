"use strict";

const Node = require("./Node.js");

module.exports = class DocumentType extends Node {
  get nodeType() {
    return 10;
  }
};
