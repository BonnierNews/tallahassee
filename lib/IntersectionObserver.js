"use strict";

const {getRootMargin, getIntersectionRatio, getIsIntersecting} = require("./intersectionCalc");
const IntersectionObserverEntry = require("./intersectionObserverEntry");

module.exports = function FakeIntersectionObserver(browser) {
  const observed = [];

  IntersectionObserver._getObserved = function () {
    return observed;
  };

  const intersectionObserverEntry = IntersectionObserverEntry(browser);
  intersectionObserverEntry.prototype.intersectionRatio = getIntersectionRatio;
  intersectionObserverEntry.prototype.isIntersecting = getIsIntersecting;
  browser.window.IntersectionObserverEntry = intersectionObserverEntry;

  return IntersectionObserver;

  function IntersectionObserver(viewPortUpdate, options) {
    const toObserve = [];
    const rootMargin = getRootMargin(options);
    browser.window.addEventListener("scroll", onScroll);
    let previousEntries = [];
    const newObservables = [];
    let callbackCallTimeout;

    return {
      disconnect() {
        toObserve.length = 0;
        previousEntries.length = 0;
      },
      observe(element) {
        toObserve.push(element);
        observed.push(element);
        newObservables.push(element);
        clearTimeout(callbackCallTimeout);
        callbackCallTimeout = setTimeout(onObserve, 0);
      },
      unobserve(element) {
        const idx = toObserve.indexOf(element);
        if (idx > -1) {
          toObserve.splice(idx, 1);
        }
      }
    };

    function onObserve() {
      const newEntries = newObservables.map((el) => intersectionObserverEntry(el, rootMargin));
      newObservables.length = 0;
      viewPortUpdate(newEntries);
      previousEntries = previousEntries.concat(newEntries);
    }

    function onScroll() {
      const entries = toObserve.map((el) => intersectionObserverEntry(el, rootMargin));
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
  }
};
