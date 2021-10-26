"use strict";

const cheerio = require("cheerio");
const elementFactory = require("./elementFactory");
const EventTarget = require("./EventTarget");
const {DOCUMENT_FRAGMENT_NODE} = require("./nodeTypes");

const dollarSymbol = Symbol.for("$");
const bodySymbol = Symbol.for("$body");
const loadedSymbol = Symbol.for("loaded");

module.exports = class DocumentFragment extends EventTarget {
  constructor(templateElement) {
    const $ = cheerio.load("", {decodeEntities: false});
    const $body = $("body");
    if (templateElement) {
      let content = "";
      templateElement.$elm.contents().each((_, elm) => {
        content += $.html(elm, {decodeEntities: true});
      });
      $body.html(content);
    }
    super(null, $body);
    this[dollarSymbol] = $;
    this[loadedSymbol] = [];
  }
  get $() {
    return this[dollarSymbol];
  }
  get nodeType() {
    return DOCUMENT_FRAGMENT_NODE;
  }
  get ownerDocument() {
    return this;
  }
  get firstElementChild() {
    const firstChild = this.$elm.find("> :first-child");
    if (!firstChild.length) return null;
    return this._getElement(firstChild);
  }
  get lastElementChild() {
    const $lastChild = this.$elm.find("> :last-child");
    if (!$lastChild.length) return null;
    return this._getElement($lastChild);
  }
  clone(deep) {
    return new DocumentFragment(deep && {$elm: this[bodySymbol]});
  }
  querySelector(selector) {
    return this._getElement(this.$elm.find(selector).eq(0)) || null;
  }
  querySelectorAll(selector) {
    return this.$elm.find(selector).map((_, e) => this._getElement(e)).toArray();
  }
  appendChild(child) {
    const $newElm = this.$elm.append(child.$elm);
    return this._getElement($newElm);
  }
  getElementById(id) {
    const selector = ("#" + id).replace(/\./g, "\\."); // eslint-disable-line
    const $idElm = this[dollarSymbol](selector).eq(0);
    if ($idElm && $idElm.length) return this._getElement($idElm);
    return null;
  }
  _getContent() {
    let content = "";
    const $ = this[dollarSymbol];
    this.$elm.contents().each((_, elm) => {
      content += $.html(elm, {decodeEntities: true});
    });
    return content;
  }
  _getElement($elm) {
    const $ = this[dollarSymbol];
    if ($elm === $) return this;
    if ($elm.nodeType) $elm = $($elm);
    if (!$elm.length) return;

    const loaded = this[loadedSymbol];
    let mockElement = loaded.find((mockedElm) => mockedElm.$elm[0] === $elm[0]);
    if (mockElement) {
      return mockElement;
    }

    mockElement = elementFactory(this, $elm);

    loaded.push(mockElement);
    return mockElement;
  }
};
