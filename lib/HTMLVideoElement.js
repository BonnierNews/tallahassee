import HTMLElement from "./HTMLElement.js";

export default class HTMLVideoElement extends HTMLElement {
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
}
