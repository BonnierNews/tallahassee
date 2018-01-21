"use strict";

module.exports = function FakeIntersectionObserver(browser) {
  const observed = [];

  IntersectionObserver._getObserved = function () {
    return observed;
  };

  return IntersectionObserver;

  function IntersectionObserver(viewPortUpdate, options) {
    const toObserve = [];
    const offset = getRootMargin(options);
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
        const {top, height} = target.getBoundingClientRect();
        const compare = top > 0 ? offset + browser.window.innerHeight : height + offset;

        const intersectionRatio = Math.abs(top) <= compare ? 1 : 0;
        return {target, intersectionRatio};
      });
    }

    function getRootMargin({rootMargin} = {}) {
      if (!rootMargin) return 0;
      const [, marginPx] = rootMargin.match(/(\d+)px \d+px/);
      return Number(marginPx);
    }
  }
};
