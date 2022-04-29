"use strict";

const DocumentType = require("./DocumentType");
const Element = require("./Element");
const HTMLAnchorElement = require("./HTMLAnchorElement");
const HTMLButtonElement = require("./HTMLButtonElement");
const HTMLFormElement = require("./HTMLFormElement");
const HTMLInputElement = require("./HTMLInputElement");
const HTMLOptionElement = require("./HTMLOptionElement");
const HTMLScriptElement = require("./HTMLScriptElement");
const HTMLSelectElement = require("./HTMLSelectElement");
const HTMLTemplateElement = require("./HTMLTemplateElement");
const HTMLTextAreaElement = require("./HTMLTextAreaElement");
const HTMLVideoElement = require("./HTMLVideoElement");
const Text = require("./Text");
const {TEXT_NODE} = require("./nodeTypes");

module.exports = function elementFactory(document, $elm) {
  const nodeType = $elm[0].nodeType;
  if (nodeType === TEXT_NODE) return new Text(document, $elm);
  const tagName = ($elm[0]?.name || "").toLowerCase();

  switch (tagName) {
    case "a":
      return new HTMLAnchorElement(document, $elm);
    case "button":
      return new HTMLButtonElement(document, $elm);
    case "form":
      return new HTMLFormElement(document, $elm);
    case "input":
      return new HTMLInputElement(document, $elm);
    case "video":
      return new HTMLVideoElement(document, $elm);
    case "template":
      return new HTMLTemplateElement(document, $elm);
    case "textarea":
      return new HTMLTextAreaElement(document, $elm);
    case "script":
      return new HTMLScriptElement(document, $elm);
    case "select":
      return new HTMLSelectElement(document, $elm);
    case "option":
      return new HTMLOptionElement(document, $elm);
    case "!doctype":
      return new DocumentType(document, $elm);
    default:
      return new Element(document, $elm);
  }
};
