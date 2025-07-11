"use strict";

const { EventEmitter } = require("events");
const { performance } = require("perf_hooks");

const { atob, btoa } = require("./atobtoa.js");
const { Event, CustomEvent, KeyboardEvent } = require("./Events.js");
const CustomElementRegistry = require("./CustomElementRegistry.js");
const Element = require("./Element.js");
const EventTarget = require("./EventTarget.js");
const HTMLElement = require("./HTMLElement.js");
const FormData = require("./FormData.js");
const History = require("./History.js");
const Location = require("./Location.js");
const MediaQueryList = require("./MediaQueryList.js");
const MutationObserver = require("./MutationObserver.js");
const Navigator = require("./Navigator.js");
const Node = require("./Node.js");
const XMLHttpRequest = require("./XMLHttpRequest.js");
const HTMLImageElement = require("./HTMLImageElement.js");
const HTMLIFrameElement = require("./HTMLIFrameElement.js");

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

module.exports = class Window extends EventTarget {
  constructor(resp, windowObjects = { console }, userAgent, options) {
    super();
    this[kResponse] = resp;
    this[kOptions] = options;

    const webPageUrl = windowObjects.location ? windowObjects.location : resp.url;
    const location = this[locationSymbol] = windowObjects.location || new Location(this, webPageUrl);

    this[navigatorSymbol] = new Navigator(userAgent);
    this[historySymbol] = new History(this, location);

    this[windowSizeSymbol] = { innerWidth: 760, innerHeight: 760 };
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
    const { location: initLocation, ...overrides } = windowObjects;
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
    this[windowSizeSymbol].innerHeight = value;
    return value;
  }
  get innerWidth() {
    return this[windowSizeSymbol].innerWidth;
  }
  set innerWidth(value) {
    this[windowSizeSymbol].innerWidth = value;
    return value;
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
      writable: false,
    });
    return Image;
  }
  get HTMLElement() {
    return HTMLElement;
  }
  get HTMLIFrameElement() {
    return HTMLIFrameElement;
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
  get KeyboardEvent() {
    return KeyboardEvent;
  }
  get CustomEvent() {
    return CustomEvent;
  }
  matchMedia(mediaQueryString) {
    return new MediaQueryList(this, mediaQueryString, this[kOptions]?.matchMedia);
  }
  scroll(xCoord, yCoord) {
    const pageOffset = this[pageOffsetSymbol];
    if (xCoord && typeof xCoord === "object") {
      const { top, left } = xCoord;
      pageOffset.Y = !isNaN(top) ? top : pageOffset.Y;
      pageOffset.X = !isNaN(left) ? left : pageOffset.X;
    } else {
      if (xCoord !== undefined) pageOffset.X = xCoord;
      if (yCoord !== undefined) pageOffset.Y = yCoord;
    }
    this.dispatchEvent(new Event("scroll"));
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
    this.dispatchEvent(new Event("resize"));
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
