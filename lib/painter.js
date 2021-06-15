"use strict";

const specificity = require("specificity");

module.exports = function Painter (options = {}) {
  const stylesheet = Styles(options.stylesheet);
  const elementStyles = new Map();

  return {
    init,
    paint,
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
  }

  function paint (target, domRectChanges) {
    if (typeof target === "string") {
      stylesheet.add({[target]: domRectChanges});
      return;
    }

    const styles = getElementStyles(target);
    for (const [prop, value] of Object.entries(domRectChanges)) {
      styles[prop] = value;
    }
  }

  function scrollWindowTo (x, y) {
    const xDelta = x - this.pageXOffset;
    const yDelta = y - this.pageYOffset;
    scrollWindowBy.call(this, xDelta, yDelta);
  }

  function scrollWindowBy (xDelta, yDelta) {
    for (const [, styles] of elementStyles) {
      const {x = 0, y = 0} = styles;
      styles.x - x - xDelta;
      styles.y - y - yDelta;
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

  function getElementStyles (source) {
    if (!elementStyles.has(source)) {
      elementStyles.set(source, {});
    }

    return elementStyles.get(source);
  }

  function getLayout (source) {
    const compoundedStyles = [
      ...stylesheet.getMatchingStyles(source),
      elementStyles.get(source),
    ]
      .filter(Boolean)
      .reduce((compounded, current) => {
        return Object.assign(compounded, current);
      }, {});

    return Layout(compoundedStyles);
  }
};

function Styles (initialRuleSet = {}) {
  const ruleSheet = {};
  let rules = [];

  add(initialRuleSet);

  return {
    getMatchingStyles,
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

  function getMatchingStyles (element) {
    return rules
      .filter(([selector]) => element.matches(selector))
      .sort(([selA], [selB]) => specificity.compare(selA, selB))
      .map(([, styles]) => styles);
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
