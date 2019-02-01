"use strict";

const {getIntersectionRatio} = require("./intersectionCalc");

module.exports = function FakeIntersectionObserverEntry(browser) {
  return IntersectionObserverEntry;

  function IntersectionObserverEntry(element, rootMargin) {
    const boundingClientRect = element.getBoundingClientRect();
    const intersectionRatio = getIntersectionRatio(boundingClientRect, browser.window.innerHeight, rootMargin);

    return {target: element, boundingClientRect, intersectionRatio};
  }
};
