"use strict";

const getLocation = require("./getLocation");
const {EventEmitter} = require("events");
const {performance} = require("perf_hooks");
const Element = require("./Element");
const url = require("url");

module.exports = function Window(resp, windowObjects, innerWidth = 760, innerHeight = 760) {
  const emitter = new EventEmitter();
  const location = getLocation(resp.request);

  let pageXOffset = 0;
  let pageYOffset = 0;

  const window = Object.assign({
    _resize: resizeWindow,
    addEventListener,
    clearTimeout: () => {},
    dispatchEvent,
    history: {
      replaceState
    },
    innerHeight,
    innerWidth,
    location,
    removeEventListener,
    scroll,
    setTimeout: (fn, ms, ...args) => fn(...args),
    requestAnimationFrame: (callback) => {
      callback(performance.now());
      return 0;
    },
    cancelAnimationFrame: () => {},
    Element
  }, windowObjects);

  Object.defineProperty(window, "pageXOffset", {
    get: () => pageXOffset
  });

  Object.defineProperty(window, "pageYOffset", {
    get: () => pageYOffset
  });

  Object.defineProperty(window, "self", {
    get: () => window
  });

  return window;

  function addEventListener(...args) {
    emitter.on(...args);
  }

  function dispatchEvent(...args) {
    emitter.emit(...args);
  }

  function removeEventListener(...args) {
    emitter.removeListener(...args);
  }

  function replaceState(ign1, ign2, relativeUrl) {
    const newUrl = url.parse(relativeUrl);
    location.path = newUrl.path;
    location.pathname = newUrl.pathname;
    location.search = newUrl.search;
    location.href = url.format(location);
  }

  function scroll(xCoord, yCoord) {
    if (xCoord !== undefined) pageXOffset = xCoord;
    if (yCoord !== undefined) pageYOffset = yCoord;
    dispatchEvent("scroll");
  }

  function resizeWindow(newInnerWidth, newInnerHeight) {
    if (newInnerWidth !== undefined) {
      window.innerWidth = newInnerWidth;
    }
    if (newInnerHeight !== undefined) {
      window.innerHeight = newInnerHeight;
    }
    window.dispatchEvent("resize");
  }
};
