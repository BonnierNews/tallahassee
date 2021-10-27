"use strict";

const nodeTypes = require("./nodeTypes");
const {NodeList} = require("./NodeList");

const documentSymbol = Symbol.for("document");
const elmSymbol = Symbol.for("$elm");

class Node {
  constructor(document, $elm) {
    this[documentSymbol] = document;
    this[elmSymbol] = $elm;
  }
  get $elm() {
    return this[elmSymbol];
  }
  get baseURI() {}
  get childNodes() {
    return new NodeList(this);
  }
  get firstChild() {
    const child = this[elmSymbol].contents().first();
    if (!child || !child[0]) return null;
    return this._getElement(child);
  }
  get isConnected() {
    return true;
  }
  get lastChild() {
    const lastChild = this[elmSymbol].contents().last();
    if (!lastChild.length) return null;
    return this._getElement(lastChild);
  }
  get nextSibling() {
    return this._getElement(this[elmSymbol].next());
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
    return this[elmSymbol][0]?.nodeType;
  }
  set nodeType(value) {
    return value;
  }
  get nodeValue() {
    return null;
  }
  get ownerDocument() {
    return this[documentSymbol];
  }
  get parentElement() {
    return this.ownerDocument._getElement(this[elmSymbol].parent());
  }
  get parentNode() {
    return this.parentElement;
  }
  get previousSibling() {
    return this.ownerDocument._getElement(this[elmSymbol].prev());
  }
  get textContent() {
    return this[elmSymbol].text();
  }
  appendChild() {
    throw new Error("Not implemented");
  }
  cloneNode(deep) {
    const $clone = this[elmSymbol].clone();
    if (!deep) {
      $clone.empty();
    }
    return this.ownerDocument._getElement($clone);
  }
  compareDocumentPosition() {
    throw new Error("Not implemented");
  }
  contains(el) {
    return this[elmSymbol] === el[elmSymbol] || this[elmSymbol].find(el[elmSymbol]).length > 0;
  }
  getRootNode() {
    return this;
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
    const $ = this.ownerDocument.$;
    return $(this[elmSymbol]).html() === $(otherNode[elmSymbol]).html();
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
  removeChild() {
    throw new Error("Not implemented");
  }
  replaceChild() {
    throw new Error("Not implemented");
  }
  _getElement($ref) {
    return this.ownerDocument._getElement(this.ownerDocument.$($ref));
  }
}

module.exports = Node;
