"use strict";

const { getRootMargin, getIntersectionRatio, getIsIntersecting } = require("./intersectionCalc");
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
    let toObserve = [];
    let previousEntries = [];
    let newObservables = [];
    const rootMargin = getRootMargin(options);
    browser.window.addEventListener("scroll", onScroll);

    return {
      disconnect() {
        toObserve = [];
        previousEntries = [];
      },
      observe(element) {
        toObserve.push(element);
        observed.push(element);
        newObservables.push(element);
        process.nextTick(onObserve);
      },
      unobserve(element) {
        toObserve = toObserve.filter((item) => item !== element);
        newObservables = newObservables.filter((item) => item !== element);
      }
    };

    function onObserve() {
      if (!newObservables.length) return;

      const newEntries = newObservables.map((el) => intersectionObserverEntry(el, rootMargin));
      newObservables = [];
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
