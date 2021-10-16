"use strict";

const Element = require("./Element");
const Form = require("./Form");
const Option = require("./Option");
const Select = require("./Select");
const Script = require("./Script");
const Template = require("./Template");
const Text = require("./Text");
const VideoElement = require("./VideoElement");
const TextArea = require("./TextArea");
const {TEXT_NODE} = require("./nodeTypes");

module.exports = function elementFactory(document, $elm) {
  const nodeType = $elm[0].nodeType;
  if (nodeType === TEXT_NODE) return new Text(document, $elm);
  const tagName = ($elm[0]?.name || "").toLowerCase();
  switch (tagName) {
    case "form":
      return new Form(document, $elm);
    case "video":
      return new VideoElement(document, $elm);
    case "template":
      return new Template(document, $elm);
    case "textarea":
      return new TextArea(document, $elm);
    case "script":
      return new Script(document, $elm);
    case "select":
      return new Select(document, $elm);
    case "option":
      return new Option(document, $elm);
    default:
      return new Element(document, $elm);
  }
};
