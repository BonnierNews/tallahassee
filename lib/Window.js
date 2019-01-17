"use strict";

const Element = require("./Element");
const getLocation = require("./getLocation");
const Navigator = require("./Navigator");
const url = require("url");
const {atob, btoa} = require("./atobtoa");
const {Event, CustomEvent} = require("./Events");
const {EventEmitter} = require("events");
const {performance} = require("perf_hooks");

module.exports = function Window(resp, windowObjects = {console}, innerWidth = 760, innerHeight = 760) {
  const emitter = new EventEmitter();
  const navigator = Navigator(resp);
  let location = getLocation(resp.request);

  let pageXOffset = 0;
  let pageYOffset = 0;

  const window = {
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
    get window() {
      return this;
    },
    Element,
    Event,
    CustomEvent,
    atob,
    btoa,
    ...windowObjects,
  };

  Object.defineProperty(window, "pageXOffset", {
    get: () => pageXOffset
  });

  Object.defineProperty(window, "pageYOffset", {
    get: () => pageYOffset
  });

  Object.defineProperty(window, "self", {
    get: () => window
  });

  Object.defineProperty(window, "location", {
    get: () => location,
    set(value) {
      const previousHref = location.href;
      let newLocation = getLocation({url: value});

      if (!newLocation.host) {
        newLocation = getLocation({url: url.resolve(previousHref, value)});
      }

      if (previousHref + newLocation.hash !== newLocation.href) {
        emitter.emit("unload");
      }

      location = newLocation;
    }
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
    if (xCoord && typeof xCoord === "object") {
      const {top, left} = xCoord;
      pageYOffset = !isNaN(top) ? top : pageYOffset;
      pageXOffset = !isNaN(left) ? left : pageXOffset;
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
