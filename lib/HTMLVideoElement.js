"use strict";

const HTMLElement = require("./HTMLElement");

module.exports = class HTMLVideoElement extends HTMLElement {
  constructor(document, $elm) {
    super(document, $elm);
  }
  play() {
    return Promise.resolve(undefined);
  }
  pause() {}
  load() {}
  canPlayType() {
    return "maybe";
  }
};
