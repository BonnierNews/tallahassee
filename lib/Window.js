"use strict";

const {atob, btoa} = require("./atobtoa");
const {Event, CustomEvent} = require("./Events");
const {EventEmitter} = require("events");
const {performance} = require("perf_hooks");
const CustomElementRegistry = require("./CustomElementRegistry");
const Element = require("./Element");
const HTMLElement = require("./HTMLElement");
const FormData = require("./FormData");
const History = require("./History");
const Location = require("./Location");
const MediaQueryList = require("./MediaQueryList");
const MutationObserver = require("./MutationObserver");
const Navigator = require("./Navigator");
const Node = require("./Node");
const url = require("url");
const XMLHttpRequest = require("./XMLHttpRequest");
const HTMLImageElement = require("./HTMLImageElement");

const kResponse = Symbol.for("response");
const kOrigin = Symbol.for("origin");
const kRequestHeaders = Symbol.for("request headers");
const navigatorSymbol = Symbol.for("navigator");
const locationSymbol = Symbol.for("location");
const emitterSymbol = Symbol.for("emitter");
const pageOffsetSymbol = Symbol.for("pageOffset");
const historySymbol = Symbol.for("history");
const windowSizeSymbol = Symbol.for("windowSize");
const kOptions = Symbol.for("browser options");
const kCustomElements = Symbol.for("custom elements");

module.exports = class Window {
  constructor(resp, windowObjects = {console}, userAgent, options) {
    this[kResponse] = resp;
    this[kOptions] = options;

    const webPageUrl = windowObjects.location ? url.format(windowObjects.location) : resp.url;
    const location = this[locationSymbol] = new Location(this, webPageUrl);

    this[navigatorSymbol] = new Navigator(userAgent);
    this[historySymbol] = new History(this, location);

    this[windowSizeSymbol] = {innerWidth: 760, innerHeight: 760};
    this[emitterSymbol] = new EventEmitter();
    this[pageOffsetSymbol] = {
      X: 0,
      Y: 0,
    };
    this[kCustomElements] = new CustomElementRegistry(this);
    this.atob = atob;
    this.btoa = btoa;
    this.MutationObserver = MutationObserver;
    const req = this.XMLHttpRequest = XMLHttpRequest.bind(null, this);
    Object.assign(req, XMLHttpRequest);

    // eslint-disable-next-line no-unused-vars
    const {location: initLocation, ...overrides} = windowObjects;
    Object.assign(this, overrides);
  }
  get self() {
    return this;
  }
  get window() {
    return this;
  }
  get pageXOffset() {
    return this[pageOffsetSymbol].X;
  }
  get pageYOffset() {
    return this[pageOffsetSymbol].Y;
  }
  get location() {
    return this[locationSymbol];
  }
  set location(value) {
    this[locationSymbol].replace(value);
  }
  get history() {
    return this[historySymbol];
  }
  get innerHeight() {
    return this[windowSizeSymbol].innerHeight;
  }
  set innerHeight(value) {
    return this[windowSizeSymbol].innerHeight = value;
  }
  get innerWidth() {
    return this[windowSizeSymbol].innerWidth;
  }
  set innerWidth(value) {
    return this[windowSizeSymbol].innerWidth = value;
  }
  get navigator() {
    return this[navigatorSymbol];
  }
  get customElements() {
    return this[kCustomElements];
  }
  get Element() {
    return Element;
  }
  get Image() {
    const self = this;
    function Image(width, height) {
      const img = self.document.createElement("img");
      img.setAttribute("width", width);
      img.setAttribute("height", height);
      return img;
    }
    Object.defineProperty(Image, "prototype", {
      value: HTMLImageElement.prototype,
      configurable: false,
      enumerable: false,
      writable: false
    });
    return Image;
  }
  get HTMLElement() {
    return HTMLElement;
  }
  get FormData() {
    return FormData;
  }
  get URL() {
    return URL;
  }
  get URLSearchParams() {
    return URLSearchParams;
  }
  get Node() {
    return Node;
  }
  get Event() {
    return Event;
  }
  get CustomEvent() {
    return CustomEvent;
  }
  addEventListener(...args) {
    this[emitterSymbol].on(...args);
  }
  removeEventListener(...args) {
    this[emitterSymbol].off(...args);
  }
  dispatchEvent(event, ...args) {
    if (event === undefined) throw new TypeError("Failed to execute 'dispatchEvent' on 'EventTarget': 1 argument required, but only 0 present.");
    if (typeof event === "string") {
      return this[emitterSymbol].emit(event, ...args);
    }

    if (!event.type) return;
    return this[emitterSymbol].emit(event.type, event);
  }
  matchMedia(mediaQueryString) {
    return new MediaQueryList(this, mediaQueryString, this[kOptions]?.matchMedia);
  }
  scroll(xCoord, yCoord) {
    const pageOffset = this[pageOffsetSymbol];
    if (xCoord && typeof xCoord === "object") {
      const {top, left} = xCoord;
      pageOffset.Y = !isNaN(top) ? top : pageOffset.Y;
      pageOffset.X = !isNaN(left) ? left : pageOffset.X;
    } else {
      if (xCoord !== undefined) pageOffset.X = xCoord;
      if (yCoord !== undefined) pageOffset.Y = yCoord;
    }
    this.dispatchEvent("scroll");
  }
  requestAnimationFrame(callback) {
    callback(performance.now());
    return 0;
  }
  cancelAnimationFrame() {}
  setTimeout(fn, _ms, ...args) {
    process.nextTick(fn, ...args);
  }
  clearTimeout() {}
  setInterval() {}
  clearInterval() {}
  _resize(newInnerWidth, newInnerHeight) {
    const windowSize = this[windowSizeSymbol];
    if (newInnerWidth !== undefined) {
      windowSize.innerWidth = newInnerWidth;
    }
    if (newInnerHeight !== undefined) {
      windowSize.innerHeight = newInnerHeight;
    }
    this.dispatchEvent("resize");
  }
  _getOrigin() {
    return this[kResponse][kOrigin];
  }
  _getRequestHeaders() {
    return this[kResponse][kRequestHeaders];
  }
  _getResponseHeaders() {
    return this[kResponse].headers;
  }
};
