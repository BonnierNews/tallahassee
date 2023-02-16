"use strict";

const DocumentType = require("./DocumentType.js");
const HTMLElement = require("./HTMLElement.js");
const HTMLAnchorElement = require("./HTMLAnchorElement.js");
const HTMLButtonElement = require("./HTMLButtonElement.js");
const HTMLDialogElement = require("./HTMLDialogElement.js");
const HTMLFieldSetElement = require("./HTMLFieldSetElement.js");
const HTMLLegendElement = require("./HTMLLegendElement.js");
const HTMLFormElement = require("./HTMLFormElement.js");
const HTMLInputElement = require("./HTMLInputElement.js");
const HTMLOptionElement = require("./HTMLOptionElement.js");
const HTMLScriptElement = require("./HTMLScriptElement.js");
const HTMLSelectElement = require("./HTMLSelectElement.js");
const HTMLTemplateElement = require("./HTMLTemplateElement.js");
const HTMLTextAreaElement = require("./HTMLTextAreaElement.js");
const HTMLImageElement = require("./HTMLImageElement.js");
const HTMLIFrameElement = require("./HTMLIFrameElement.js");
const HTMLVideoElement = require("./HTMLVideoElement.js");
const Text = require("./Text.js");
const { TEXT_NODE } = require("./nodeTypes.js");

module.exports = class ElementFactory {
  constructor(document) {
    this.document = document;
    this.definitions = {
      a: HTMLAnchorElement,
      button: HTMLButtonElement,
      dialog: HTMLDialogElement,
      fieldset: HTMLFieldSetElement,
      legend: HTMLLegendElement,
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

  create($elm) {
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

    return new HTMLElement(document, $elm);
  }

  define(tagName, TagClass) {
    this.custom[tagName] = TagClass;
  }

  get(name) {
    return this.custom[name];
  }
};
