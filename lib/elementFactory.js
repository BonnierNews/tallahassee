import DocumentType from "./DocumentType.js";
import HTMLElement from "./HTMLElement.js";
import HTMLAnchorElement from "./HTMLAnchorElement.js";
import HTMLButtonElement from "./HTMLButtonElement.js";
import HTMLDialogElement from "./HTMLDialogElement.js";
import HTMLFieldSetElement from "./HTMLFieldSetElement.js";
import HTMLLegendElement from "./HTMLLegendElement.js";
import HTMLFormElement from "./HTMLFormElement.js";
import HTMLInputElement from "./HTMLInputElement.js";
import HTMLOptionElement from "./HTMLOptionElement.js";
import HTMLScriptElement from "./HTMLScriptElement.js";
import HTMLSelectElement from "./HTMLSelectElement.js";
import HTMLTemplateElement from "./HTMLTemplateElement.js";
import HTMLTextAreaElement from "./HTMLTextAreaElement.js";
import HTMLImageElement from "./HTMLImageElement.js";
import HTMLIFrameElement from "./HTMLIFrameElement.js";
import HTMLVideoElement from "./HTMLVideoElement.js";
import Text from "./Text.js";
import { TEXT_NODE } from "./nodeTypes.js";

export default function ElementFactory(document) {
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

  return new HTMLElement(document, $elm);
};

ElementFactory.prototype.define = function define(tagName, TagClass) {
  this.custom[tagName] = TagClass;
};

ElementFactory.prototype.get = function get(name) {
  return this.custom[name];
};
