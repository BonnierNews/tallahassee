"use strict";

const getLocation = require("./getLocation");
const {EventEmitter} = require("events");

module.exports = function Window(resp, windowObjects, innerHeight = 760) {
  const location = getLocation(resp.request);

  const emitter = new EventEmitter();
  const window = Object.assign({
    innerHeight,
    location,
    addEventListener,
    dispatchEvent,
    scroll: dispatchEvent.bind(null, "scroll"),
    setTimeout: (fn, ms, ...args) => fn(...args),
    removeEventListener,
    history: {
      replaceState
    },
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
};
