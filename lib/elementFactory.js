"use strict";

const Element = require("./Element");
const Form = require("./Form");
const Template = require("./Template");
const Text = require("./Text");
const VideoElement = require("./VideoElement");
const {TEXT_NODE} = require("./nodeTypes");

module.exports = function elementFactory(document, $elm) {
  const nodeType = $elm[0].nodeType;
  if (nodeType === TEXT_NODE) return new Text(document, $elm);
  const tagName = ($elm[0]?.name || "").toLowerCase();
  if (tagName === "form") return new Form(document, $elm);
  if (tagName === "video") return new VideoElement(document, $elm);
  if (tagName === "template") return new Template(document, $elm);
  return new Element(document, $elm);
};
