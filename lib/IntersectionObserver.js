"use strict";

const {getRootMargin, getIntersectionRatio} = require("./intersectionCalc");

module.exports = function FakeIntersectionObserver(browser) {
  const observed = [];

  IntersectionObserver._getObserved = function () {
    return observed;
  };

  return IntersectionObserver;

  function IntersectionObserver(viewPortUpdate, options) {
    const toObserve = [];
    const rootMargin = getRootMargin(options);
    browser.window.addEventListener("scroll", onScroll);

    return {
      disconnect() {
        toObserve.length = 0;
      },
      observe(element) {
        toObserve.push(element);
        observed.push(element);
        onScroll();
      },
      unobserve(element) {
        const idx = toObserve.indexOf(element);
        if (idx > -1) {
          toObserve.splice(idx, 1);
        }
      }
    };

    function onScroll() {
      viewPortUpdate(makeEntries(toObserve.slice()));
    }

    function makeEntries(observedEntries) {
      return observedEntries.map((target) => {
        const boundingClientRect = target.getBoundingClientRect();
        const intersectionRatio = getIntersectionRatio(boundingClientRect, browser.window.innerHeight, rootMargin);

        return {target, boundingClientRect, intersectionRatio};
      });
    }
  }
};
