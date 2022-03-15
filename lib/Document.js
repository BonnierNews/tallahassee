"use strict";

const { Event } = require("./Events");
const { EventEmitter } = require("events");
const cheerio = require("cheerio");
const Comment = require("./Comment");
const DocumentFragment = require("./DocumentFragment");
const DOMImplementation = require("./DOMImplementation");
const elementFactory = require("./elementFactory");
const HTMLCollection = require("./HTMLCollection");
const Location = require("./Location");

const cookieJarSymbol = Symbol.for("cookieJar");
const dollarSymbol = Symbol.for("$");
const loadedSymbol = Symbol.for("loaded");
const locationSymbol = Symbol.for("location");
const referrerSymbol = Symbol.for("referrer");
const emitterSymbol = Symbol.for("emitter");
const fullscreenElementSymbol = Symbol.for("fullscreenElement");

module.exports = class Document {
  constructor(source, cookieJar) {
    this[locationSymbol] = source.location || new Location(this, source.url);
    this[referrerSymbol] = source.referrer || "";
    this[dollarSymbol] = cheerio.load(source.text || "", {decodeEntities: false});
    this[cookieJarSymbol] = cookieJar;
    this[loadedSymbol] = [];
    this[emitterSymbol] = new EventEmitter();
    this[fullscreenElementSymbol] = null;
  }
  get _emitter() {
    return this[emitterSymbol];
  }
  get $() {
    return this[dollarSymbol];
  }
  get documentElement() {
    return this._getElement(this[dollarSymbol]("html"));
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
    return this._getElement(this[dollarSymbol]("head"));
  }
  get body() {
    return this._getElement(this[dollarSymbol]("body"));
  }
  get firstElementChild() {
    return this.documentElement;
  }
  get firstChild() {
    return this._getElement(this[dollarSymbol]("> :first-child"));
  }
  get fullscreenElement() {
    return this[fullscreenElementSymbol];
  }
  get cookie() {
    return this[cookieJarSymbol].getCookies({
      path: this.location.pathname,
      script: true,
      domain: this.location.hostname,
      secure: this.location.protocol === "https:",
    }).toValueString();
  }
  set cookie(value) {
    this[cookieJarSymbol].setCookie(value);
  }
  get title() {
    return this._getElement(this[dollarSymbol]("head > title")).textContent;
  }
  set title(value) {
    this._getElement(this[dollarSymbol]("head > title")).textContent = value;
  }
  get nodeType() {
    return 9;
  }
  get forms() {
    return this.documentElement.getElementsByTagName("form");
  }
  get implementation() {
    return new DOMImplementation(this);
  }
  addEventListener(...args) {
    this[emitterSymbol].on(...args);
  }
  removeEventListener(...args) {
    this[emitterSymbol].removeListener(...args);
  }
  createDocumentFragment() {
    return new DocumentFragment(this);
  }
  createElement(elementTagName) {
    const element = elementFactory(this, this.$(`<${elementTagName}></${elementTagName}>`));
    this[loadedSymbol].push(element);
    return element;
  }
  createElementNS(namespaceURI, elementTagName) {
    return this.createElement(elementTagName);
  }
  createTextNode(text) {
    return {
      textContent: text,
    };
  }
  createComment(data) {
    return new Comment(null, this[dollarSymbol](`<!--${data}-->`));
  }
  dispatchEvent(event) {
    if (event && event.type === "fullscreenchange") {
      if (!event.target) return;

      if (this[fullscreenElementSymbol] === null) {
        this[fullscreenElementSymbol] = event.target;
      } else if (this[fullscreenElementSymbol] === event.target) {
        this[fullscreenElementSymbol] = null;
      }

      this[emitterSymbol].emit("fullscreenchange", event);
    } else {
      this[emitterSymbol].emit(event.type, event);
    }
  }
  exitFullscreen() {
    const fullscreenchangeEvent = new Event("fullscreenchange");
    fullscreenchangeEvent.target = this[fullscreenElementSymbol];

    this.dispatchEvent(fullscreenchangeEvent);
  }
  getElementById(id) {
    const selector = ("#" + id).replace(/\./g, "\\."); // eslint-disable-line
    const $idElm = this[dollarSymbol](selector).eq(0);
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
    return new HTMLCollection(this.documentElement, `[name="${name}"],#${name}`, {attributes: true});
  }
  importNode(element, deep) {
    if (element instanceof DocumentFragment) {
      return new DocumentFragment(this, deep && element);
    }

    return element.cloneNode(deep);
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
