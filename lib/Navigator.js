"use strict";

module.exports = function Navigator(userAgent) {
  const navigator = {};
  const geolocation = Geolocation();

  Object.defineProperty(navigator, "userAgent", {
    configurable: false,
    get: () => {
      return userAgent || "Tallahassee";
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
