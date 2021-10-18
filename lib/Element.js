"use strict";

const CssStyleDeclaration = require("./CSSStyleDeclaration");
const DOMException = require("domexception");
const DOMStringMap = require("./DOMStringMap");
const DOMTokenList = require("./DOMTokenList");
const EventTarget = require("./EventTarget");
const makeAbsolute = require("./makeAbsolute");
const {DOCUMENT_FRAGMENT_NODE} = require("./nodeTypes");
const {Event} = require("./Events");
const {getElementsByClassName, getElementsByTagName} = require("./HTMLCollection");

const inputElements = ["INPUT", "BUTTON", "TEXTAREA"];

const classListSymbol = Symbol.for("classList");
const datasetSymbol = Symbol.for("dataset");
const documentSymbol = Symbol.for("document");
const dollarSymbol = Symbol.for("$");
const elmSymbol = Symbol.for("$elm");
const emitterSymbol = Symbol.for("emitter");
const eventTargetSymbol = Symbol.for("eventTarget");
const rectsSymbol = Symbol.for("rects");
const scrolledSymbol = Symbol.for("scrolled");
const stylesSymbol = Symbol.for("styles");
const tagNameSymbol = Symbol.for("tagName");

module.exports = class Element extends EventTarget {
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
    this[classListSymbol] = new DOMTokenList(this);
    this[datasetSymbol] = new DOMStringMap(this);
    this[stylesSymbol] = new CssStyleDeclaration(this);

    this._emitter.on("_insert", (...args) => {
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
};
