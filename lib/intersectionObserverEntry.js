"use strict";

const { getIntersectionRatio, getIsIntersecting } = require("./intersectionCalc.js");

module.exports = function fakeIntersectionObserverEntry(browser) {
  return class IntersectionObserverEntry {
    constructor(element, rootMargin) {
      const boundingClientRect = element.getBoundingClientRect();
      const intersectionRatio = getIntersectionRatio(boundingClientRect, browser.window.innerHeight, rootMargin);
      const isIntersecting = getIsIntersecting(intersectionRatio);

      return { target: element, boundingClientRect, intersectionRatio, isIntersecting };
    }
  };
};
