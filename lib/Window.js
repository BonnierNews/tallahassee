"use strict";

const Element = require("./Element");
const getLocation = require("./getLocation");
const Navigator = require("./Navigator");
const url = require("url");
const {Event, CustomEvent} = require("./Events");
const {EventEmitter} = require("events");
const {performance} = require("perf_hooks");

module.exports = function Window(resp, windowObjects, innerWidth = 760, innerHeight = 760) {
  const emitter = new EventEmitter();
  const location = getLocation(resp.request);
  const navigator = Navigator(resp);

  let pageXOffset = 0;
  let pageYOffset = 0;

  const window = Object.assign({
    _resize: resizeWindow,
    addEventListener,
    dispatchEvent,
    matchMedia,
    history: {
      replaceState
    },
    innerHeight,
    innerWidth,
    location,
    navigator,
    removeEventListener,
    scroll,
    setTimeout: (fn, ms, ...args) => {
      fn(...args);
      return 0;
    },
    clearTimeout: () => {},
    requestAnimationFrame: (callback) => {
      callback(performance.now());
      return 0;
    },
    cancelAnimationFrame: () => {},
    Element,
    Event,
    CustomEvent
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

  function dispatchEvent(event, ...args) {
    if (event === undefined) throw new TypeError("Failed to execute 'dispatchEvent' on 'EventTarget': 1 argument required, but only 0 present.");
    if (typeof event === "string") {
      return emitter.emit(event, ...args);
    }

    if (!event.type) return;
    return emitter.emit(event.type, event);
  }

  function removeEventListener(...args) {
    emitter.removeListener(...args);
  }

  function matchMedia(media) {
    if (media === undefined) throw new TypeError("Failed to execute 'matchMedia' on 'Window': 1 argument required, but only 0 present.");
    if (typeof media === "string") {
      window.styleMedia = window.styleMedia || { type: "screen" };
      return {
        media,
        matches: media === window.styleMedia.type
      };
    }
  }

  function replaceState(ign1, ign2, relativeUrl) {
    const newUrl = url.parse(relativeUrl);
    location.path = newUrl.path;
    location.pathname = newUrl.pathname;
    location.search = newUrl.search;
    location.href = url.format(location);
  }

  function scroll(xCoord, yCoord) {
    if (typeof xCoord === "object") {
      pageYOffset = xCoord.top || pageYOffset;
      pageXOffset = xCoord.left || pageXOffset;
    } else {
      if (xCoord !== undefined) pageXOffset = xCoord;
      if (yCoord !== undefined) pageYOffset = yCoord;
    }
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
