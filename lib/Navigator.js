"use strict";

const getHeaders = require("./getHeaders");

module.exports = function Navigator(resp) {
  const navigator = {};
  const headers = getHeaders(resp.request);
  const geolocation = Geolocation();

  Object.defineProperty(navigator, "userAgent", {
    configurable: false,
    get: () => {
      return headers["user-agent"] || "Tallahassee";
    },
    set: (value) => value
  });

  Object.defineProperty(navigator, "geolocation", {
    get: () => {
      return geolocation;
    },
    set: (value) => value
  });

  return navigator;
};

function Geolocation() {
  return {
    getCurrentPosition,
    watchPosition,
    clearWatch
  };

  function getCurrentPosition() {
    return {};
  }
  function watchPosition() {}
  function clearWatch() {}
}
