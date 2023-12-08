"use strict";

const HTMLElement = require("./HTMLElement.js");

module.exports = class HTMLAudioElement extends HTMLElement {
  constructor(document, $elm) {
    super(document, $elm);
    this.paused = true;
    this.duration = 0;
    this.currentTime = 0;
    this.volume = 1;
  }
  play() {
    this.paused = false;
    return Promise.resolve(undefined);
  }
  pause() {
    this.paused = true;
  }
  load() {}
  _setDuration(duration) {
    this.duration = duration;
  }
};
