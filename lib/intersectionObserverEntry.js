import { getIntersectionRatio, getIsIntersecting } from "./intersectionCalc.js";

export default function fakeIntersectionObserverEntry(browser) {
  return class IntersectionObserverEntry {
    constructor(element, rootMargin) {
      const boundingClientRect = element.getBoundingClientRect();
      const intersectionRatio = getIntersectionRatio(boundingClientRect, browser.window.innerHeight, rootMargin);
      const isIntersecting = getIsIntersecting(intersectionRatio);

      return { target: element, boundingClientRect, intersectionRatio, isIntersecting };
    }
  };
}
