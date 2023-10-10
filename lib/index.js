"use strict";

const Document = require("./Document.js");
const IntersectionObserver = require("./IntersectionObserver.js");
const MutationObserver = require("./MutationObserver.js");
const Storage = require("./Storage.js");
const Window = require("./Window.js");
const HTMLCollection = require("./HTMLCollection.js");

module.exports = {
  Window,
  Document,
  Storage,
  HTMLCollection,
  IntersectionObserver,
  MutationObserver,
};
