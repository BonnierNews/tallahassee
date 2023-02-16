"use strict";

const parentSymbol = Symbol.for("parent");
const emitterSymbol = Symbol.for("emitter");

module.exports = class Location extends URL {
  constructor(parent, url = "/", origin = "https://localhost:3000") {
    super(url, origin);
    this[parentSymbol] = parent;
  }
  get username() {
    return undefined;
  }
  get password() {
    return undefined;
  }
  get searchParams() {
    return undefined;
  }
  replace(url) {
    if (url.startsWith("#")) {
      this.hash = url;
      return url;
    }
    const oldHref = this.toString();
    this.href = new URL(url, this.origin).toString();

    if (this.hash && oldHref + this.hash === this.toString()) {
      return;
    }
    const emitter = this[parentSymbol] && this[parentSymbol][emitterSymbol];
    if (emitter) emitter.emit("unload");
  }
  reload() {

  }
};
