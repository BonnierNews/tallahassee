"use strict";

const DOMException = require("domexception");

const nodeTypes = require("./nodeTypes.js");
const NodeList = require("./NodeList.js");
const EventTarget = require("./EventTarget.js");

const kDocument = Symbol.for("document");
const kElm = Symbol.for("$elm");

module.exports = class Node extends EventTarget {
  constructor(document, $elm) {
    super();
    this[kDocument] = document;
    this[kElm] = $elm;
  }
  get $elm() {
    return this[kElm];
  }
  get baseURI() {
    return this[kDocument].defaultView.location.href;
  }
  get childNodes() {
    return new NodeList(this);
  }
  get firstChild() {
    const child = this[kElm].contents().first();
    if (!child || !child[0]) return null;
    return this._getElement(child);
  }
  get isConnected() {
    return true;
  }
  get lastChild() {
    const lastChild = this[kElm].contents().last();
    if (!lastChild.length) return null;
    return this._getElement(lastChild);
  }
  get nextSibling() {
    return this._getElement(this[kElm].next());
  }
  get nodeName() {
    switch (this.nodeType) {
      case nodeTypes.TEXT_NODE:
        return "#text";
      case nodeTypes.CDATA_SECTION_NODE:
        return "#cdata-section";
      case nodeTypes.COMMENT_NODE:
        return "#comment";
      case nodeTypes.DOCUMENT_NODE:
        return "#document";
      case nodeTypes.DOCUMENT_FRAGMENT_NODE:
        return "#document-fragment";
      case nodeTypes.ATTRIBUTE_NODE:
      case nodeTypes.PROCESSING_INSTRUCTION_NODE:
      case nodeTypes.DOCUMENT_TYPE_NODE:
      case nodeTypes.ELEMENT_NODE:
      default:
        throw new Error("Not implemented");
    }
  }
  get nodeType() {
    return this[kElm][0]?.nodeType;
  }
  set nodeType(value) {
    return value;
  }
  get nodeValue() {
    return null;
  }
  get ownerDocument() {
    return this[kDocument];
  }
  get parentElement() {
    return this.ownerDocument?._getElement(this[kElm].parent()) || null;
  }
  get parentNode() {
    return this.parentElement;
  }
  get previousSibling() {
    return this.ownerDocument?._getElement(this[kElm].prev()) || null;
  }
  get textContent() {
    return this[kElm].text();
  }
  appendChild() {
    throw new Error("Not implemented");
  }
  cloneNode(deep) {
    if (this.nodeType === nodeTypes.DOCUMENT_NODE) {
      throw new Error("Not implemented");
    }

    const $clone = this[kElm].clone();
    if (!deep) {
      $clone.empty();
    }
    return this.ownerDocument._getElement($clone);
  }
  compareDocumentPosition() {
    throw new Error("Not implemented");
  }
  contains(el) {
    return this.ownerDocument?.$.contains(this[kElm], el[kElm]);
  }
  getRootNode() {
    return this.ownerDocument || this;
  }
  hasChildNodes() {
    return this.firstChild !== null;
  }
  insertBefore() {
    throw new Error("Not implemented");
  }
  isDefaultNamespace() {
    return true;
  }
  isEqualNode(otherNode) {
    const $ = this.ownerDocument?.$ || this[kElm];
    return $(this[kElm]).html() === $(otherNode[kElm]).html();
  }
  isSameNode(otherNode) {
    return this === otherNode;
  }
  isSupported() {
    throw new Error("Not implemented");
  }
  lookupNamespaceURI() {
    return null;
  }
  lookupPrefix() {
    return null;
  }
  normalize() {
    throw new Error("Not implemented");
  }
  removeChild(child) {
    if (this.$elm[0].children.indexOf(child.$elm[0]) === -1) {
      throw new DOMException("Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.");
    }

    child.$elm.remove();
    this._emitter.emit("_insert");
    return child;
  }
  replaceChild() {
    throw new Error("Not implemented");
  }
  _getElement($ref) {
    return this.ownerDocument._getElement(this.ownerDocument.$($ref));
  }
};
