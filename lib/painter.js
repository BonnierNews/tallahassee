"use strict";

module.exports = function Painter (options = {}) {
  const stylesheet = Stylesheet(options.stylesheet);
  const layouts = new Map();

  return {
    init,
  };

  function init (window) {
    window.scrollTo = window.scroll = scrollWindowTo;
    window.scrollBy = scrollWindowBy;
    Object.defineProperties(window.Element.prototype, {
      getBoundingClientRect: { value: GetElementDomRect() },
      scrollIntoView: { value: scrollWindowToElement },
    });
    Object.defineProperties(window.HTMLElement.prototype, {
      offsetWidth: { get: GetElementDomRect("width") },
      offsetHeight: { get: GetElementDomRect("height") },
      offsetLeft: { get: GetElementDomRect("x") },
      offsetTop: { get: GetElementDomRect("y") },
    });

    return paint;
  }

  function paint (element, domRectChanges) {
    const layout = getLayout(element);
    for (const [prop, value] of Object.entries(domRectChanges)) {
      layout[prop] = value;
    }
  }

  function scrollWindowTo (x, y) {
    const xDelta = x - this.pageXOffset;
    const yDelta = y - this.pageYOffset;
    scrollWindowBy.call(this, xDelta, yDelta);
  }

  function scrollWindowBy (xDelta, yDelta) {
    for (const [, layout] of layouts) {
      layout.x = layout.x - xDelta;
      layout.y = layout.y - yDelta;
    }

    this.pageXOffset += xDelta;
    this.pageYOffset += yDelta;
    this.dispatchEvent(new this.Event("scroll"));
  }

  function scrollWindowToElement () {
    const { x, y } = getLayout(this);
    scrollWindowBy.call(this.ownerDocument.defaultView, x, y);
  }

  function GetElementDomRect (prop) {
    return function getElementDomRect () {
      const layout = getLayout(this);
      if (!prop) return layout;
      return layout[prop];
    }
  }

  function getLayout (source) {
    if (!layouts.has(source)) {
      layouts.set(source, Layout(stylesheet.getCompoundedStyles(source)));
    }

    return layouts.get(source);
  }
};

function Stylesheet (initialRuleSet = {}) {
  const ruleSheet = {};
  let rules = [];

  add(initialRuleSet);

  return {
    getCompoundedStyles,
  };

  function add(...ruleSets) {
    Object.assign(ruleSheet, ...ruleSets);
    rules = [];

    for (const [selectorList, styles] of Object.entries(ruleSheet)) {
      for (const selector of selectorList.split(",")) {
        rules.push([selector, styles]);
      }
    }
  }

  function getCompoundedStyles (element) {
    return rules
      .map(([selector, styles]) => element.matches(selector) ? styles : null)
      .filter(Boolean)
      .reduce((compoundedStyles, styles) => Object.assign(compoundedStyles, styles), {});
  }
}

function Layout (boundingBox = {}) {
  return Object.preventExtensions({
    width: boundingBox.width || 0,
    height: boundingBox.height || 0,
    x: boundingBox.x || 0,
    y: boundingBox.y || 0,
    get left () {
      return Math.min(this.x, this.x + this.width);
    },
    get right () {
      return Math.max(this.x + this.width, this.x);
    },
    get top () {
      return Math.min(this.y, this.y + this.height);
    },
    get bottom () {
      return Math.max(this.y + this.height, this.y);
    },
  });
}
