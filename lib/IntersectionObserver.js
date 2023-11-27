"use strict";

const { getRootMargin } = require("./intersectionCalc.js");
const fakeIntersectionObserverEntry = require("./intersectionObserverEntry.js");

const kToObserve = Symbol.for("toObserve");
const kPrevEntries = Symbol.for("previousEntries");
const kNewObserv = Symbol.for("newObservables");
const kUpdate = Symbol.for("viewportUpdate");
const kRootMargin = Symbol.for("rootMargin");

module.exports = function fakeIntersectionObserver(browser) {
  let observed = [];

  const IntersectionObserverEntry = fakeIntersectionObserverEntry(browser);
  browser.window.IntersectionObserverEntry = IntersectionObserverEntry;

  class IntersectionObserver {
    constructor(viewportUpdate, options) {
      this[kToObserve] = [];
      this[kPrevEntries] = [];
      this[kNewObserv] = [];
      this[kUpdate] = viewportUpdate;
      this[kRootMargin] = getRootMargin(options);

      browser.window.addEventListener("scroll", () => {
        const entries = this[kToObserve].map((el) => new IntersectionObserverEntry(el, this[kRootMargin]));
        const changedEntries = entries.filter((entry) => {
          const previous = this[kPrevEntries].find((x) => x.target === entry.target);
          if (!previous) return true;
          return entry.intersectionRatio !== previous.intersectionRatio;
        });
        if (changedEntries.length > 0) {
          viewportUpdate(changedEntries);
        }

        this[kPrevEntries] = entries;
      });
    }

    disconnect() {
      this[kToObserve] = [];
      this[kPrevEntries] = [];
    }

    observe(element) {
      this[kToObserve].push(element);
      observed.push(element);
      this[kNewObserv].push(element);
      process.nextTick(() => {
        if (!this[kNewObserv].length) return;

        const newEntries = this[kNewObserv].map((el) => new IntersectionObserverEntry(el, this[kRootMargin]));
        this[kNewObserv] = [];
        this[kUpdate](newEntries);
        this[kPrevEntries] = this[kPrevEntries].concat(newEntries);
      });
    }

    unobserve(element) {
      observed = observed.filter((item) => item !== element);
      this[kToObserve] = this[kToObserve].filter((item) => item !== element);
      this[kNewObserv] = this[kNewObserv].filter((item) => item !== element);
    }
  }

  IntersectionObserver._getObserved = function () {
    return observed;
  };

  return IntersectionObserver;
};
