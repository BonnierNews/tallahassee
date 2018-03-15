"use strict";

module.exports = {
  getRootMargin,
  getIntersectionRatio
};

function getRootMargin({rootMargin = ""} = {}) {
  const [top, right, bottom, left] = rootMargin
    .split(" ")
    .map((num) => parseInt(num));

  return {
    top: firstOf(top),
    right: firstOf(right, top),
    bottom: firstOf(bottom, top),
    left: firstOf(left, right, top)
  };
}

function firstOf(...args) {
  for (let i = 0; i < args.length; i++) {
    if (args[i] !== undefined && !isNaN(args[i])) {
      return args[i];
    }
  }

  return 0;
}

function getIntersectionRatio(boundingClientRect, windowInnerHeight, rootMargin = {}) {
  const {top, height} = boundingClientRect;
  const {top: marginTop, bottom: marginBottom} = rootMargin;

  const isBelowTop = (top + height) > -(marginTop || 0);
  const isAboveBottom = top < windowInnerHeight + (marginBottom || 0);

  const isInside = isBelowTop && isAboveBottom;

  return isInside ? 1 : 0;
}
