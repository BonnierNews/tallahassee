"use strict";

const DocumentType = require("./DocumentType");
const Element = require("./Element");
const HTMLAnchorElement = require("./HTMLAnchorElement");
const HTMLButtonElement = require("./HTMLButtonElement");
const HTMLDialogElement = require("./HTMLDialogElement");
const HTMLFormElement = require("./HTMLFormElement");
const HTMLInputElement = require("./HTMLInputElement");
const HTMLOptionElement = require("./HTMLOptionElement");
const HTMLScriptElement = require("./HTMLScriptElement");
const HTMLSelectElement = require("./HTMLSelectElement");
const HTMLTemplateElement = require("./HTMLTemplateElement");
const HTMLTextAreaElement = require("./HTMLTextAreaElement");
const HTMLImageElement = require("./HTMLImageElement");
const HTMLIFrameElement = require("./HTMLIFrameElement");
const HTMLVideoElement = require("./HTMLVideoElement");
const Text = require("./Text");
const {TEXT_NODE} = require("./nodeTypes");

module.exports = ElementFactory;

function ElementFactory(document) {
  this.document = document;
  this.definitions = {
    a: HTMLAnchorElement,
    button: HTMLButtonElement,
    dialog: HTMLDialogElement,
    img: HTMLImageElement,
    iframe: HTMLIFrameElement,
    form: HTMLFormElement,
    input: HTMLInputElement,
    video: HTMLVideoElement,
    template: HTMLTemplateElement,
    textarea: HTMLTextAreaElement,
    script: HTMLScriptElement,
    select: HTMLSelectElement,
    option: HTMLOptionElement,
    "!doctype": DocumentType,
  };
  this.custom = {};
}

ElementFactory.prototype.create = function define($elm) {
  const nodeType = $elm[0].nodeType;
  const document = this.document;
  if (nodeType === TEXT_NODE) return new Text(document, $elm);
  const tagName = ($elm[0]?.name || "").toLowerCase();
  const definitions = this.definitions;
  if (tagName in definitions) return new definitions[tagName](document, $elm);
  const custom = this.custom;
  if (tagName in custom) {
    const elm = new custom[tagName](document, $elm);
    if (elm.connectedCallback) elm.connectedCallback();
    return elm;
  }

  return new Element(document, $elm);
};

ElementFactory.prototype.define = function define(tagName, TagClass) {
  this.custom[tagName] = TagClass;
};

ElementFactory.prototype.get = function get(name) {
  return this.custom[name];
};
