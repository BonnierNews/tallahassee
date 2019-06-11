"use strict";

const Document = require("./Document");
const IntersectionObserver = require("./IntersectionObserver");
const MutationObserver = require("./MutationObserver");
const Storage = require("./Storage");
const Window = require("./Window");
const {HTMLCollection} = require("./HTMLCollection");

module.exports = {
  Document,
  HTMLCollection,
  IntersectionObserver,
  MutationObserver,
  Window,
  Storage
};
