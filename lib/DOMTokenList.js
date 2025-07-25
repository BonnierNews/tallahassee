"use strict";

const elementSymbol = Symbol.for("element");
const emitterSymbol = Symbol.for("emitter");

module.exports = class DOMTokenList {
  constructor(element) {
    this[elementSymbol] = element;
  }
  get _classes() {
    return (this[elementSymbol].$elm.attr("class") || "").split(" ");
  }
  contains(className) {
    return this[elementSymbol].$elm.hasClass(className);
  }
  add(...classNames) {
    const element = this[elementSymbol];
    element.$elm.addClass(classNames.join(" "));
    element.setAttribute("class", element.$elm.attr("class"));
    element[emitterSymbol].emit("_classadded", ...classNames);
  }
  remove(...classNames) {
    const element = this[elementSymbol];
    element.$elm.removeClass(classNames.join(" "));
    element.setAttribute("class", element.$elm.attr("class"));
    element[emitterSymbol].emit("_classremoved", ...classNames);
  }
  toggle(className, force) {
    const hasClass = this[elementSymbol].$elm.hasClass(className);

    if (force === undefined) {
      const methodName = this.contains(className) ? "remove" : "add";
      this[methodName](className);
      return !hasClass;
    }

    if (force) {
      this.add(className);
    } else {
      this.remove(className);
    }
    return !hasClass;
  }
};
