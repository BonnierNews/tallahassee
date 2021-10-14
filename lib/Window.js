"use strict";

const Element = require("./Element");
const getLocation = require("./getLocation");
const Navigator = require("./Navigator");
const url = require("url");
const {atob, btoa} = require("./atobtoa");
const {Event, CustomEvent} = require("./Events");
const {EventEmitter} = require("events");
const {performance} = require("perf_hooks");
const MediaQueryList = require("./MediaQueryList");

const navigatorSymbol = Symbol.for("navigator");
const locationSymbol = Symbol.for("location");
const emitterSymbol = Symbol.for("emitter");
const pageOffsetSymbol = Symbol.for("pageOffset");
const historySymbol = Symbol.for("history");
const windowSizeSymbol = Symbol.for("windowSize");
const windowSymbol = Symbol.for("window");
const historyStatesSymbol = Symbol.for("historyStates");
const currentHistoryStateSymbol = Symbol.for("currentHistoryState");

class History {
  constructor(window, location) {
    this[windowSymbol] = window;
    this[historyStatesSymbol] = [{...location}];
    this[currentHistoryStateSymbol] = 0;
  }
  go(delta) {
    if (delta === 0) return;
    // It should not be possible to go back to a state before the first one
    const current = this[currentHistoryStateSymbol];
    if (delta < 0 && Math.abs(delta) > current) return;
    // It should not be possible to go to a state that is beyond the stored states
    const states = this[historyStatesSymbol];
    if (delta > 0 && delta >= states.length - this[currentHistoryStateSymbol]) return;
    const newState = states[current + delta];
    const location = this[windowSymbol].location;
    location.path = newState.path;
    location.pathname = newState.pathname;
    location.search = newState.search;
    location.href = url.format(location);
    this[currentHistoryStateSymbol] += delta;
  }
  back() {
    this.go(-1);
  }
  forward() {
    this.go(1);
  }
  pushState(ign1, ign2, relativeUrl) {
    const newUrl = url.parse(relativeUrl);
    const location = this[windowSymbol].location;
    location.path = newUrl.path;
    location.pathname = newUrl.pathname;
    location.search = newUrl.search;
    location.href = url.format(location);
    const current = ++this[currentHistoryStateSymbol];
    this[historyStatesSymbol] = this[historyStatesSymbol].slice(0, current);
    this[historyStatesSymbol].push({...location});
  }
  replaceState(ign1, ign2, relativeUrl) {
    const newUrl = url.parse(relativeUrl);
    const location = this[windowSymbol].location;
    location.path = newUrl.path;
    location.pathname = newUrl.pathname;
    location.search = newUrl.search;
    location.href = url.format(location);
  }
}

class Window {
  constructor(resp, windowObjects = {console}, userAgent) {
    const location = this[locationSymbol] = windowObjects.location || getLocation(resp.url);
    this[navigatorSymbol] = new Navigator(userAgent);
    this[historySymbol] = new History(this, location);

    this[windowSizeSymbol] = {innerWidth: 760, innerHeight: 760};
    this[emitterSymbol] = new EventEmitter();
    this[pageOffsetSymbol] = {
      X: 0,
      Y: 0,
    };
    this.atob = atob;
    this.btoa = btoa;

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
    const previousHref = this[locationSymbol].href;
    let newLocation = getLocation(value);

    if (!newLocation.host) {
      newLocation = getLocation(url.resolve(previousHref, value));
    }

    if (previousHref + newLocation.hash !== newLocation.href) {
      this[emitterSymbol].emit("unload");
    }

    this[locationSymbol] = newLocation;
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
  get Element() {
    return Element;
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
  matchMedia(...args) {
    return MediaQueryList.call(this, ...args);
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
}

module.exports = Window;
