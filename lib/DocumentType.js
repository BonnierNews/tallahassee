"use strict";

const Node = require("./Node");

module.exports = class DocumentType extends Node {
  get nodeType() {
    return 10;
  }
};
