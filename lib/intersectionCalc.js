export {
  getRootMargin,
  getIntersectionRatio,
  getIsIntersecting,
};

function getRootMargin({ rootMargin = "" } = {}) {
  const [ top, right, bottom, left ] = rootMargin
    .split(" ")
    .map((num) => parseInt(num));

  return {
    top: firstOf(top),
    right: firstOf(right, top),
    bottom: firstOf(bottom, top),
    left: firstOf(left, right, top),
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
  const { top, height, bottom = top + height } = boundingClientRect;
  const { top: marginTop, bottom: marginBottom } = rootMargin;

  const topIntersection = -(marginTop || 0);
  const bottomIntersection = windowInnerHeight + (marginBottom || 0);

  if (top < topIntersection) {
    return Math.max((bottom - topIntersection) / height, 0);
  }

  if (bottom > bottomIntersection) {
    return Math.max((bottomIntersection - top) / height, 0);
  }

  return 1;
}

function getIsIntersecting(intersectionRatio) {
  return intersectionRatio > 0;
}
