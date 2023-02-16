"use strict";

const userAgentSymbol = Symbol.for("userAgent");
const geolocationSymbol = Symbol.for("geolocation");

class Geolocation {
  getCurrentPosition() {
    return {};
  }
  watchPosition() {}
  clearWatch() {}
}

module.exports = class Navigator {
  constructor(userAgent) {
    this[userAgentSymbol] = userAgent || "Tallahassee";
    this[geolocationSymbol] = new Geolocation();
  }
  get userAgent() {
    return this[userAgentSymbol];
  }
  set userAgent(value) {
    return value;
  }
  get geolocation() {
    return this[geolocationSymbol];
  }
  set geolocation(value) {
    return value;
  }
};
