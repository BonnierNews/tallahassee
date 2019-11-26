"use strict";

const {getIntersectionRatio, getIsIntersecting} = require("./intersectionCalc");

module.exports = function FakeIntersectionObserverEntry(browser) {
  return IntersectionObserverEntry;

  function IntersectionObserverEntry(element, rootMargin) {
    const boundingClientRect = element.getBoundingClientRect();
    const intersectionRatio = getIntersectionRatio(boundingClientRect, browser.window.innerHeight, rootMargin);
    const isIntersecting = getIsIntersecting(intersectionRatio);

    return {target: element, boundingClientRect, intersectionRatio, isIntersecting};
  }
};
