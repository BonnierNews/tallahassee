"use strict";

const cheerio = require("cheerio");

const { Event } = require("./Events.js");
const { DOCUMENT_NODE } = require("./nodeTypes.js");
const Comment = require("./Comment.js");
const DocumentFragment = require("./DocumentFragment.js");
const DOMImplementation = require("./DOMImplementation.js");
const ElementFactory = require("./elementFactory.js");
const HTMLCollection = require("./HTMLCollection.js");
const Location = require("./Location.js");
const Node = require("./Node.js");
const NodeList = require("./NodeList.js");

const kCookieJar = Symbol.for("cookieJar");
const kDollar = Symbol.for("$");
const loadedSymbol = Symbol.for("loaded");
const locationSymbol = Symbol.for("location");
const windowSymbol = Symbol.for("window");
const referrerSymbol = Symbol.for("referrer");
const fullscreenElementSymbol = Symbol.for("fullscreenElement");
const kElementFactory = Symbol.for("element factory");
const kActiveElement = Symbol.for("activeElement");

module.exports = class Document extends Node {
  constructor(source, cookieJar, window) {
    const $ = cheerio.load(source.text || "", { decodeEntities: false });
    super(null, $.root());
    this[windowSymbol] = window;
    this[locationSymbol] = source.location || new Location(this, source.url);
    this[referrerSymbol] = source.referrer || "";
    this[kDollar] = $;
    this[kCookieJar] = cookieJar;
    this[loadedSymbol] = [];
    this[fullscreenElementSymbol] = null;
    this[kElementFactory] = new ElementFactory(this);
  }
  get $() {
    return this[kDollar];
  }
  get documentElement() {
    return this._getElement(this[kDollar]("html"));
  }
  get defaultView() {
    return this[windowSymbol] || null;
  }
  get location() {
    return this[locationSymbol];
  }
  get referrer() {
    return this[referrerSymbol];
  }
  get textContent() {
    return null;
  }
  get head() {
    return this._getElement(this[kDollar]("head"));
  }
  get body() {
    return this._getElement(this[kDollar]("body"));
  }
  get activeElement() {
    return this[kActiveElement] || this.body;
  }
  get firstElementChild() {
    return this.documentElement;
  }
  get fullscreenElement() {
    return this[fullscreenElementSymbol];
  }
  get cookie() {
    return this[kCookieJar].getCookies({
      path: this.location.pathname,
      script: true,
      domain: this.location.hostname,
      secure: this.location.protocol === "https:",
    }).toValueString();
  }
  set cookie(value) {
    this[kCookieJar].setCookie(value);
  }
  get title() {
    return this._getElement(this[kDollar]("head > title")).textContent;
  }
  set title(value) {
    this._getElement(this[kDollar]("head > title")).textContent = value;
  }
  get nodeType() {
    return DOCUMENT_NODE;
  }
  get forms() {
    return this.documentElement.getElementsByTagName("form");
  }
  get implementation() {
    return new DOMImplementation(this);
  }
  contains(el) {
    return this.documentElement.contains(el);
  }
  createDocumentFragment() {
    return new DocumentFragment(this);
  }
  createElement(elementTagName) {
    const element = this[kElementFactory].create(this.$(`<${elementTagName}></${elementTagName}>`));
    this[loadedSymbol].push(element);
    return element;
  }
  createElementNS(namespaceURI, elementTagName) {
    return this.createElement(elementTagName);
  }
  createTextNode(text) {
    return { textContent: text };
  }
  createComment(data) {
    return new Comment(null, this[kDollar](`<!--${data}-->`));
  }
  dispatchEvent(event) {
    if (event?.type === "fullscreenchange" && event.target) {
      if (this[fullscreenElementSymbol] === null) {
        this[fullscreenElementSymbol] = event.target;
      } else if (this[fullscreenElementSymbol] === event.target) {
        this[fullscreenElementSymbol] = null;
      }
    }

    super.dispatchEvent(event);
  }
  exitFullscreen() {
    const fullScreenElm = this[fullscreenElementSymbol];
    fullScreenElm?.dispatchEvent(new Event("fullscreenchange", { bubbles: true }));
    this[fullscreenElementSymbol] = null;
  }
  getElementById(id) {
    const selector = ("#" + id).replace(/\./g, "\\."); // eslint-disable-line
    const $idElm = this[kDollar](selector).eq(0);
    if ($idElm && $idElm.length) return this._getElement($idElm);
    return null;
  }
  getElementsByTagName(name) {
    return this.documentElement.getElementsByTagName(name);
  }
  getElementsByClassName(classNames) {
    return this.documentElement.getElementsByClassName(classNames);
  }
  getElementsByName(name) {
    return new HTMLCollection(this.documentElement, `[name="${name}"],#${name}`, { attributes: true });
  }
  importNode(element, deep) {
    if (element instanceof DocumentFragment) {
      return new DocumentFragment(this, deep && element);
    }

    return element.cloneNode(deep);
  }
  querySelector(selector) {
    const elements = this.$(selector);
    if (!elements.length) return null;
    return this._getElement(elements.eq(0));
  }
  querySelectorAll(selectors) {
    return new NodeList(this.documentElement, selectors, { disconnected: true });
  }
  _setActiveElement(element) {
    this[kActiveElement] = element;
  }
  _getElement($elm) {
    const $ = this[kDollar];
    if ($elm === $) return this;
    if ($elm.nodeType) $elm = $($elm);
    if (!$elm.length) return;

    const tag = $elm[0].name;

    const loaded = this[loadedSymbol];

    let mockElement = loaded.find((mockedElm) => mockedElm?.$elm[0] === $elm[0]);

    if (mockElement) {
      return mockElement;
    }

    mockElement = this[kElementFactory].create($elm);

    loaded.push(mockElement);

    if (this[kElementFactory].isCustom(tag) && mockElement.connectedCallback) {
      mockElement.connectedCallback();
    }

    return mockElement;
  }
};
