"use strict";

const DOMException = require("domexception");
const makeAbsolute = require("./makeAbsolute");
const Node = require("./Node");
const {EventEmitter} = require("events");
const {Event} = require("./Events");
const {getElementsByClassName, getElementsByTagName} = require("./HTMLCollection");
const {DOCUMENT_FRAGMENT_NODE} = require("./nodeTypes");
const DOMStringMap = require("./DOMStringMap");

const inputElements = ["INPUT", "BUTTON", "TEXTAREA"];

const datasetSymbol = Symbol.for("dataset");
const documentSymbol = Symbol.for("document");
const elmSymbol = Symbol.for("$elm");
const dollarSymbol = Symbol.for("$");
const tagNameSymbol = Symbol.for("tagName");
const eventTargetSymbol = Symbol.for("eventTarget");
const rectsSymbol = Symbol.for("rects");
const emitterSymbol = Symbol.for("emitter");
const classListSymbol = Symbol.for("classList");
const scrolledSymbol = Symbol.for("scrolled");
const stylesSymbol = Symbol.for("styles");

class Element extends Node {
  constructor(document, $elm) {
    super(document, $elm);

    this[documentSymbol] = document;
    this[elmSymbol] = $elm;
    this[dollarSymbol] = document.$;
    this[tagNameSymbol] = (($elm[0] && $elm[0].name) || "").toLowerCase();
    this[eventTargetSymbol] = null;

    const rects = this[rectsSymbol] = {
      top: 99999,
      bottom: 99999,
      right: 0,
      left: 0,
      height: 0,
      width: 0
    };

    rects.bottom = rects.top + rects.height;

    this[scrolledSymbol] = {left: 0, top: 0};
    this[classListSymbol] = ClassList(this);
    this[datasetSymbol] = new DOMStringMap(this);
    this[stylesSymbol] = Styles(this);

    const emitter = this[emitterSymbol] = new EventEmitter();
    emitter.setMaxListeners(0);

    Object.assign(this, EventListeners(this));

    emitter.on("_insert", (...args) => {
      if (this.parentElement) {
        this.parentElement[emitterSymbol].emit("_insert", ...args);
      }
    }).on("_attributeChange", (...args) => {
      if (this.parentElement) {
        this.parentElement[emitterSymbol].emit("_attributeChange", ...args);
      }
    });
  }
  get id() {
    return this.getAttribute("id");
  }
  set id(value) {
    return this.setAttribute("id", value);
  }
  get name() {
    return this.getAttribute("name");
  }
  set name(value) {
    return this.setAttribute("name", value);
  }
  get type() {
    return this.getAttribute("type");
  }
  set type(value) {
    return this.setAttribute("type", value);
  }
  get tagName() {
    return this[elmSymbol][0]?.name?.toUpperCase();
  }
  get nodeName() {
    return this.tagName;
  }
  get firstChild() {
    const child = this[elmSymbol].contents().first();
    if (!child || !child[0]) return null;
    return this.ownerDocument._getElement(child);
  }
  get firstElementChild() {
    const firstChild = this[elmSymbol].find("> :first-child");
    if (!firstChild.length) return null;
    return this.ownerDocument._getElement(firstChild);
  }
  get lastChild() {
    const lastChild = this[elmSymbol].contents().last();
    if (!lastChild.length) return null;
    return this.ownerDocument._getElement(lastChild);
  }
  get lastElementChild() {
    const $lastChild = this[elmSymbol].find("> :last-child");
    if (!$lastChild.length) return null;
    return this.ownerDocument._getElement($lastChild);
  }
  get previousElementSibling() {
    return this.ownerDocument._getElement(this[elmSymbol].prev());
  }
  get nextElementSibling() {
    return this.ownerDocument._getElement(this[elmSymbol].next());
  }
  get children() {
    if (!this[elmSymbol]) return [];
    return this[elmSymbol].children().map((_, e) => this.ownerDocument._getElement(this[dollarSymbol](e))).toArray();
  }
  get innerHTML() {
    return this[elmSymbol].html();
  }
  set innerHTML(value) {
    this[elmSymbol].html(value);
    this[emitterSymbol].emit("_insert");
  }
  get textContent() {
    return this[elmSymbol].text();
  }
  set textContent(value) {
    const response = this[elmSymbol].text(value);
    this[emitterSymbol].emit("_insert");
    return response;
  }
  get innerText() {
    return this.textContent;
  }
  set innerText(value) {
    this.textContent = value;
  }
  get outerHTML() {
    return this[dollarSymbol].html(this[elmSymbol]);
  }
  set outerHTML(value) {
    this[elmSymbol].replaceWith(this[dollarSymbol](value));
    this[emitterSymbol].emit("_insert");
  }
  get href() {
    const rel = this.getAttribute("href");
    return makeAbsolute(this.ownerDocument.location, rel);
  }
  set href(value) {
    this.setAttribute("href", value);
  }
  get src() {
    const rel = this.getAttribute("src");
    return makeAbsolute(this.ownerDocument.location, rel);
  }
  set src(value) {
    this.setAttribute("src", value);
    this.dispatchEvent(new Event("load", {bubbles: true}));
  }
  get checked() {
    return this[elmSymbol].prop("checked");
  }
  set checked(value) {
    const type = this.getAttribute("type");
    if (type === "checkbox") this[elmSymbol].prop("checked", value);
    if (type !== "radio") return;

    const name = this.getAttribute("name");
    const $form = this[elmSymbol].closest("form");
    if ($form && $form.length) {
      $form.find(`input[type="radio"][name="${name}"]`).removeAttr("checked");
    } else {
      this[dollarSymbol](`input[type="radio"][name="${name}"]`).removeAttr("checked");
    }

    this.setAttribute("checked", value);
  }
  get disabled() {
    if (!inputElements.includes(this.tagName)) return;
    return this[elmSymbol].prop("disabled");
  }
  set disabled(value) {
    if (value === true) return this.setAttribute("disabled", "disabled");
    this[elmSymbol].removeAttr("disabled");
  }
  get className() {
    return this.getAttribute("class");
  }
  get classList() {
    return this[classListSymbol];
  }
  set className(value) {
    this.setAttribute("class", value);
  }
  get form() {
    return this.ownerDocument._getElement(this[elmSymbol].closest("form"));
  }
  get offsetWidth() {
    return this[rectsSymbol].width;
  }
  get offsetHeight() {
    return this[rectsSymbol].height;
  }
  get dataset() {
    return this[datasetSymbol];
  }
  get style() {
    return this[stylesSymbol];
  }
  get value() {
    if (!inputElements.includes(this.tagName)) return;
    const value = this.getAttribute("value");
    if (value === undefined) return "";
    return value;
  }
  set value(val) {
    if (!inputElements.includes(this.tagName)) return;
    this.setAttribute("value", val);
  }
  get scrollWidth() {
    return this.children.reduce((acc, el) => {
      acc += el.getBoundingClientRect().width;
      return acc;
    }, 0);
  }
  get scrollHeight() {
    return this.children.reduce((acc, el) => {
      acc += el.getBoundingClientRect().height;
      return acc;
    }, 0);
  }
  get scrollLeft() {
    return this[scrolledSymbol].left;
  }
  set scrollLeft(value) {
    const maxScroll = this.scrollWidth - this.offsetWidth;
    if (value > maxScroll) value = maxScroll;
    else if (value < 0) value = 0;
    this.onElementScroll(value);
    this[scrolledSymbol].left = value;
    this.dispatchEvent(new Event("scroll", { bubbles: true }));
  }
  get scrollTop() {
    return this[scrolledSymbol].top;
  }
  set scrollTop(value) {
    const maxScroll = this.scrollHeight - this.offsetHeight;
    if (value > maxScroll) value = maxScroll;
    else if (value < 0) value = 0;

    this.onElementScroll(undefined, value);
    this[scrolledSymbol].top = value;
    this.dispatchEvent(new Event("scroll", { bubbles: true }));
  }
  appendChild(childElement) {
    if (childElement.nodeType === DOCUMENT_FRAGMENT_NODE) {
      this.insertAdjacentHTML("beforeend", childElement._getContent());
    } else if (childElement[elmSymbol]) {
      this[elmSymbol].append(childElement[elmSymbol]);

      if (childElement.tagName === "SCRIPT") {
        childElement._runScript();
      }

      this[emitterSymbol].emit("_insert");
    } else if (childElement.textContent) {
      this.insertAdjacentHTML("beforeend", childElement.textContent);
    }
  }
  click() {
    if (this.disabled) return;
    const clickEvent = new Event("click", { bubbles: true });

    let changed = false;
    if (this.type === "radio") {
      changed = !this.checked;
      this.checked = true;
    }

    if (this.type === "checkbox") {
      changed = true;
      this.checked = !this.checked;
    }

    this.dispatchEvent(clickEvent);

    if (!clickEvent.defaultPrevented && this.form) {
      if (changed) {
        this.dispatchEvent(new Event("change", { bubbles: true }));
      } else if (!this.type || this.type === "submit") {
        const submitEvent = new Event("submit", { bubbles: true });
        submitEvent._submitElement = this;
        this.form.dispatchEvent(submitEvent);
      } else if (this.type === "reset") {
        this.form.reset();
      }
    }
  }
  closest(selector) {
    return this.ownerDocument._getElement(this[elmSymbol].closest(selector));
  }
  contains(el) {
    return this[elmSymbol] === el[elmSymbol] || this[elmSymbol].find(el[elmSymbol]).length > 0;
  }
  dispatchEvent(event) {
    if (event.cancelBubble) return;
    event.path.push(this);
    if (!event.target) {
      event.target = this;
    }
    this[emitterSymbol].emit(event.type, event);
    if (event.bubbles) {
      if (this.parentElement) return this.parentElement.dispatchEvent(event);

      if (this.ownerDocument.firstElementChild === this) {
        this.ownerDocument.dispatchEvent(event);
      }
    }
  }
  focus() {
    if (this.disabled) return;
    const focusEvent = new Event("focus", { bubbles: true });
    this.dispatchEvent(focusEvent);
  }
  getAttribute(name) {
    return this[elmSymbol].attr(name);
  }
  hasAttribute(name) {
    return this[elmSymbol].is(`[${name}]`);
  }
  setAttribute(name, val) {
    this[elmSymbol].attr(name, val);
    this[emitterSymbol].emit("_attributeChange", name, this);
  }
  getBoundingClientRect() {
    return this[rectsSymbol];
  }
  getElementsByClassName(classNames) {
    return getElementsByClassName(this, classNames);
  }
  getElementsByTagName(name) {
    return getElementsByTagName(this, name);
  }
  insertAdjacentHTML(position, markup) {
    switch (position) {
      case "beforebegin":
        this[elmSymbol].before(markup);
        if (this.parentElement) this.parentElement[emitterSymbol].emit("_insert");
        break;
      case "afterbegin":
        this[elmSymbol].prepend(markup);
        this[emitterSymbol].emit("_insert");
        break;
      case "beforeend":
        this[elmSymbol].append(markup);
        this[emitterSymbol].emit("_insert");
        break;
      case "afterend":
        this[elmSymbol].after(markup);
        if (this.parentElement) this.parentElement[emitterSymbol].emit("_insert");
        break;
      default:
        throw new DOMException(`Failed to execute 'insertAdjacentHTML' on 'Element': The value provided (${position}) is not one of 'beforeBegin', 'afterBegin', 'beforeEnd', or 'afterEnd'.`);
    }
  }
  insertBefore(newNode, referenceNode) {
    if (referenceNode === null) {
      this.appendChild(newNode);
      return newNode;
    }

    if (newNode[elmSymbol]) {
      if (referenceNode.parentElement !== this) {
        throw new DOMException("Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.");
      }
      newNode[elmSymbol].insertBefore(referenceNode[elmSymbol]);
      this[emitterSymbol].emit("_insert");
      return newNode;
    }

    if (newNode.textContent) {
      referenceNode[elmSymbol].before(newNode.textContent);
      this[emitterSymbol].emit("_insert");
      return newNode;
    }
  }
  matches(selector) {
    try {
      return this[elmSymbol].is(selector);
    } catch (error) {
      throw new DOMException(`Failed to execute 'matches' on 'Element': '${selector}' is not a valid selector.`, "SyntaxError");
    }
  }
  remove() {
    this[elmSymbol].remove();
  }
  removeChild(child) {
    if (this[elmSymbol][0].children.indexOf(child[elmSymbol][0]) === -1) {
      throw new DOMException("Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.");
    }

    child[elmSymbol].remove();
    this[emitterSymbol].emit("_insert");
    return child;
  }
  removeAttribute(name) {
    this[elmSymbol].removeAttr(name);
  }
  requestFullscreen() {
    const fullscreenchangeEvent = new Event("fullscreenchange", { bubbles: true });
    fullscreenchangeEvent.target = this;

    this.ownerDocument.dispatchEvent(fullscreenchangeEvent);
  }
  cloneNode(deep) {
    const $clone = this[elmSymbol].clone();
    if (!deep) {
      $clone.empty();
    }
    return this.ownerDocument._getElement($clone);
  }
  /* TODO: MOVE somewhere else */
  _setBoundingClientRect(axes) {
    if (!("bottom" in axes)) {
      axes.bottom = axes.top;
    }

    for (const axis in axes) {
      if (axes.hasOwnProperty(axis)) {
        this[rectsSymbol][axis] = axes[axis];
      }
    }

    this[rectsSymbol].height = this[rectsSymbol].bottom - this[rectsSymbol].top;
    this[rectsSymbol].width = this[rectsSymbol].right - this[rectsSymbol].left;

    return this[rectsSymbol];
  }
  setElementsToScroll(elmsToScrollFn) {
    this.elementsToScroll = elmsToScrollFn;
  }
  onElementScroll(scrollLeft, scrollTop) {
    if (!this.elementsToScroll) return;
    const elms = this.elementsToScroll(this.ownerDocument);
    if (!elms || !elms.length) return;

    if (scrollLeft !== undefined) this.onHorizontalScroll(elms, scrollLeft);
    if (scrollTop !== undefined) this.onVerticalScroll(elms, scrollTop);
  }
  onHorizontalScroll(elms, scrollLeft) {
    const delta = this[scrolledSymbol].left - scrollLeft;

    elms.slice().forEach((elm) => {
      const {left, right} = elm.getBoundingClientRect();
      elm._setBoundingClientRect({
        left: (left || 0) + delta,
        right: (right || 0) + delta
      });
    });
  }
  onVerticalScroll(elms, scrollTop) {
    const delta = this[scrolledSymbol].top - scrollTop;

    elms.slice().forEach((elm) => {
      const {top, bottom} = elm.getBoundingClientRect();
      elm._setBoundingClientRect({
        top: (top || 0) + delta,
        bottom: (bottom || 0) + delta
      });
    });
  }
}

module.exports = Element;

function ClassList(element) {
  const $elm = element[elmSymbol];
  if (!$elm.attr) return;

  const classListApi = {
    contains(className) {
      return $elm.hasClass(className);
    },
    add(...classNames) {
      $elm.addClass(classNames.join(" "));
      element[emitterSymbol].emit("_classadded", ...classNames);
      element[emitterSymbol].emit("_attributeChange", "class", element);
    },
    remove(...classNames) {
      $elm.removeClass(classNames.join(" "));
      element[emitterSymbol].emit("_classremoved", ...classNames);
      element[emitterSymbol].emit("_attributeChange", "class", element);
    },
    toggle(className, force) {
      const hasClass = $elm.hasClass(className);

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

  Object.defineProperty(classListApi, "_classes", {
    get: getClassArray
  });

  return classListApi;

  function getClassArray() {
    return ($elm.attr("class") || "").split(" ");
  }
}

function Styles(element) {
  const elementStyle = element.getAttribute("style") || "";
  const prefixNamePattern = /^(-?)(moz|ms|webkit)([A-Z]|\1)/;

  const Style = {};
  if (elementStyle) {
    elementStyle.replace(/\s*(.+?):\s*(.*?)(;|$)/g, (_, name, value) => {
      let ccName = name.replace(prefixNamePattern, (__, isPrefix, prefix, suffix) => {
        return prefix + suffix;
      });
      ccName = ccName.replace(/-(\w)(\w+)/g, (__, firstLetter, rest) => `${firstLetter.toUpperCase()}${rest}`);
      Style[ccName] = value;
    });
  }

  Object.defineProperty(Style, "removeProperty", {
    enumerable: false,
    value: removeProperty
  });

  const StyleHandler = {
    set(target, name, value) {
      if (!name) return false;
      target[name] = handleResetValue(value);
      setStyle();
      return true;
    },
    deleteProperty(target, name) {
      if (!name) return false;
      delete target[name];
      setStyle();
      return true;
    }
  };

  return new Proxy(Style, StyleHandler);

  function removeProperty(name) {
    delete Style[name];
    setStyle();
  }

  function setStyle() {
    const keys = Object.keys(Style);
    if (!keys.length) return element.removeAttribute("style");
    const styleValue = keys.reduce((result, name) => {
      const value = Style[name];
      if (value === undefined || value === "") return result;

      let kcName = name.replace(prefixNamePattern, (__, isPrefix, prefix, suffix) => {
        return `-${prefix}${suffix}`;
      });

      kcName = kcName.replace(/([A-Z])([a-z]+)/g, (__, firstLetter, rest) => `-${firstLetter.toLowerCase()}${rest}`);

      result += `${kcName}: ${value};`;
      return result;
    }, "");

    if (!styleValue) return element.removeAttribute("style");
    element.setAttribute("style", styleValue);
  }

  function handleResetValue(value) {
    if (value === "" || value === null) return "";
    return value;
  }
}

function EventListeners(element) {
  const listeners = [];
  return {
    addEventListener,
    removeEventListener
  };

  function addEventListener(name, fn, options) {
    const config = [name, fn, usesCapture(options), boundFn];
    const existingListenerIndex = getExistingIndex(...config);
    if (existingListenerIndex !== -1) return;

    listeners.push(config);
    element[emitterSymbol].on(name, boundFn);

    function boundFn(...args) {
      fn.apply(element, args);

      if (options && options.once) {
        removeEventListener(name, fn);
      }
    }
  }

  function removeEventListener(name, fn, options) {
    const existingListenerIndex = getExistingIndex(name, fn, usesCapture(options));
    if (existingListenerIndex === -1) return;

    const existingListener = listeners[existingListenerIndex];
    const boundFn = existingListener[3];

    element[emitterSymbol].removeListener(name, boundFn);
    listeners.splice(existingListenerIndex, 1);
  }

  function usesCapture(options) {
    if (typeof options === "object") {
      return !!options.capture;
    }

    return !!options;
  }

  function getExistingIndex(...config) {
    return listeners.findIndex((listener) => {
      return listener[0] === config[0]
        && listener[1] === config[1]
        && listener[2] === config[2];
    });
  }
}
