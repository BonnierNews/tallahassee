import cheerio from "cheerio";
import Node from "./Node.js";
import {DOCUMENT_FRAGMENT_NODE} from "./nodeTypes.js";

const dollarSymbol = Symbol.for("$");
const bodySymbol = Symbol.for("$body");
const loadedSymbol = Symbol.for("loaded");

export default class DocumentFragment extends Node {
  constructor(document, templateElement) {
    const $ = cheerio.load("", {decodeEntities: false});
    const $body = $("body");
    if (templateElement) {
      let content = "";
      templateElement.$elm.contents().each((_, elm) => {
        content += $.html(elm, {decodeEntities: true});
      });
      $body.html(content);
    }
    super(document, $body);
    this[dollarSymbol] = $;
    this[loadedSymbol] = [];
  }
  get $() {
    return this[dollarSymbol];
  }
  get nodeType() {
    return DOCUMENT_FRAGMENT_NODE;
  }
  get firstElementChild() {
    const firstChild = this.$elm.find("> :first-child");
    if (!firstChild.length) return null;
    return this.ownerDocument._getElement(firstChild);
  }
  get location() {
    const firstChild = this.$elm.find("> :first-child");
    if (!firstChild.length) return null;
    return this.ownerDocument._getElement(firstChild);
  }
  get lastElementChild() {
    const $lastChild = this.$elm.find("> :last-child");
    if (!$lastChild.length) return null;
    return this.ownerDocument._getElement($lastChild);
  }
  clone(deep) {
    return new DocumentFragment(this.ownerDocument, deep && {$elm: this[bodySymbol]});
  }
  querySelector(selector) {
    return this.ownerDocument._getElement(this.$elm.find(selector).eq(0)) || null;
  }
  querySelectorAll(selector) {
    return this.$elm.find(selector).map((_, e) => this.ownerDocument._getElement(e)).toArray();
  }
  appendChild(child) {
    const $newElm = this.$elm.append(child.$elm);
    return this.ownerDocument._getElement($newElm);
  }
  getElementById(id) {
    const selector = ("#" + id).replace(/\./g, "\\."); // eslint-disable-line
    const $idElm = this[dollarSymbol](selector).eq(0);
    if ($idElm && $idElm.length) return this.ownerDocument._getElement($idElm);
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
}
