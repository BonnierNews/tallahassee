"use strict";

const getLocation = require("./getLocation");
const {EventEmitter} = require("events");

module.exports = function Window(resp, windowObjects, innerWidth = 760, innerHeight = 760) {
  const location = getLocation(resp.request);

  const emitter = new EventEmitter();
  const window = Object.assign({
    _resize: resizeWindow,
    addEventListener,
    clearTimeout: () => {},
    document: {
      addEventListener
    },
    dispatchEvent,
    history: {
      replaceState
    },
    innerHeight,
    innerWidth,
    location,
    removeEventListener,
    scroll: dispatchEvent.bind(null, "scroll"),
    setTimeout: (fn, ms, ...args) => fn(...args),
  }, windowObjects);

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
    location.path = relativeUrl;
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
