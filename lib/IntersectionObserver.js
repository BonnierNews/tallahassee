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
    let previousEntries = [];

    return {
      disconnect() {
        toObserve.length = 0;
      },
      observe(element) {
        toObserve.push(element);
        observed.push(element);
        const newEntries = [element].map(toEntry);
        viewPortUpdate(newEntries);
        previousEntries = previousEntries.concat(newEntries);
      },
      unobserve(element) {
        const idx = toObserve.indexOf(element);
        if (idx > -1) {
          toObserve.splice(idx, 1);
        }
      }
    };

    function onScroll() {
      const entries = toObserve.map(toEntry);
      const changedEntries = entries.filter(hasChanged);

      if (changedEntries.length > 0) {
        viewPortUpdate(changedEntries);
      }

      previousEntries = entries;
    }

    function hasChanged(entry) {
      const previous = previousEntries.find((x) => x.target === entry.target);
      if (!previous) return true;
      return entry.intersectionRatio !== previous.intersectionRatio;
    }

    function toEntry(element) {
      const boundingClientRect = element.getBoundingClientRect();
      const intersectionRatio = getIntersectionRatio(boundingClientRect, browser.window.innerHeight, rootMargin);

      return {target: element, boundingClientRect, intersectionRatio};
    }
  }
};
