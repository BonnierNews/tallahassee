"use strict";

const getLocation = require("./getLocation");
const {EventEmitter} = require("events");
const Element = require("./Element");


module.exports = function Window(resp, windowObjects, innerWidth = 760, innerHeight = 760) {
  const emitter = new EventEmitter();
  const location = getLocation(resp.request);

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
    Element
  }, windowObjects);

  Object.defineProperty(window, "pageYOffset", {
    get: () => pageYOffset
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
    location.path = relativeUrl;
  }

  function scroll(xCoord, yCoord) {
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
