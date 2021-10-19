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
const rectsSymbol = Symbol.for("rects");
const scrolledSymbol = Symbol.for("scrolled");
const stylesSymbol = Symbol.for("styles");

module.exports = class Element extends EventTarget {
  constructor(document, $elm) {
    super(document, $elm);

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
        this.parentElement._emitter.emit("_insert", ...args);
      }
    }).on("_attributeChange", (...args) => {
      if (this.parentElement) {
        this.parentElement._emitter.emit("_attributeChange", ...args);
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
    return this.$elm[0]?.name?.toUpperCase();
  }
  get nodeName() {
    return this.tagName;
  }
  get firstChild() {
    const child = this.$elm.contents().first();
    if (!child || !child[0]) return null;
    return this._getElement(child);
  }
  get firstElementChild() {
    const firstChild = this.$elm.find("> :first-child");
    if (!firstChild.length) return null;
    return this._getElement(firstChild);
  }
  get lastChild() {
    const lastChild = this.$elm.contents().last();
    if (!lastChild.length) return null;
    return this._getElement(lastChild);
  }
  get lastElementChild() {
    const $lastChild = this.$elm.find("> :last-child");
    if (!$lastChild.length) return null;
    return this._getElement($lastChild);
  }
  get previousElementSibling() {
    return this._getElement(this.$elm.prev());
  }
  get nextElementSibling() {
    return this._getElement(this.$elm.next());
  }
  get children() {
    if (!this.$elm) return [];
    return this.$elm.children().map((_, e) => this._getElement(e)).toArray();
  }
  get innerHTML() {
    return this.$elm.html();
  }
  set innerHTML(value) {
    this.$elm.html(value);
    this._emitter.emit("_insert");
  }
  get textContent() {
    return this.$elm.text();
  }
  set textContent(value) {
    const response = this.$elm.text(value);
    this._emitter.emit("_insert");
    return response;
  }
  get innerText() {
    return this.textContent;
  }
  set innerText(value) {
    this.textContent = value;
  }
  get outerHTML() {
    return this.ownerDocument.$.html(this.$elm);
  }
  set outerHTML(value) {
    this.$elm.replaceWith(this.ownerDocument.$(value));
    this._emitter.emit("_insert");
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
    return this.$elm.prop("checked");
  }
  set checked(value) {
    const type = this.getAttribute("type");
    if (type === "checkbox") this.$elm.prop("checked", value);
    if (type !== "radio") return;

    const name = this.getAttribute("name");
    const $form = this.$elm.closest("form");
    if ($form && $form.length) {
      $form.find(`input[type="radio"][name="${name}"]`).removeAttr("checked");
    } else {
      this.ownerDocument.$(`input[type="radio"][name="${name}"]`).removeAttr("checked");
    }

    this.setAttribute("checked", value);
  }
  get disabled() {
    if (!inputElements.includes(this.tagName)) return;
    return this.$elm.prop("disabled");
  }
  set disabled(value) {
    if (value === true) return this.setAttribute("disabled", "disabled");
    this.$elm.removeAttr("disabled");
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
    return this._getElement(this.$elm.closest("form"));
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
    } else if (childElement.$elm) {
      this.$elm.append(childElement.$elm);

      if (childElement.tagName === "SCRIPT") {
        childElement._runScript();
      }

      this._emitter.emit("_insert");
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
    return this._getElement(this.$elm.closest(selector));
  }
  contains(el) {
    return this.$elm === el.$elm || this.$elm.find(el.$elm).length > 0;
  }
  focus() {
    if (this.disabled) return;
    const focusEvent = new Event("focus", { bubbles: true });
    this.dispatchEvent(focusEvent);
  }
  getAttribute(name) {
    return this.$elm.attr(name);
  }
  hasAttribute(name) {
    return this.$elm.is(`[${name}]`);
  }
  setAttribute(name, val) {
    this.$elm.attr(name, val);
    this._emitter.emit("_attributeChange", name, this);
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
        this.$elm.before(markup);
        if (this.parentElement) this.parentElement._emitter.emit("_insert");
        break;
      case "afterbegin":
        this.$elm.prepend(markup);
        this._emitter.emit("_insert");
        break;
      case "beforeend":
        this.$elm.append(markup);
        this._emitter.emit("_insert");
        break;
      case "afterend":
        this.$elm.after(markup);
        if (this.parentElement) this.parentElement._emitter.emit("_insert");
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

    if (newNode.$elm) {
      if (referenceNode.parentElement !== this) {
        throw new DOMException("Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.");
      }
      newNode.$elm.insertBefore(referenceNode.$elm);
      this._emitter.emit("_insert");
      return newNode;
    }

    if (newNode.textContent) {
      referenceNode.$elm.before(newNode.textContent);
      this._emitter.emit("_insert");
      return newNode;
    }
  }
  matches(selector) {
    try {
      return this.$elm.is(selector);
    } catch (error) {
      throw new DOMException(`Failed to execute 'matches' on 'Element': '${selector}' is not a valid selector.`, "SyntaxError");
    }
  }
  remove() {
    this.$elm.remove();
  }
  removeChild(child) {
    if (this.$elm[0].children.indexOf(child.$elm[0]) === -1) {
      throw new DOMException("Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.");
    }

    child.$elm.remove();
    this._emitter.emit("_insert");
    return child;
  }
  removeAttribute(name) {
    this.$elm.removeAttr(name);
  }
  requestFullscreen() {
    const fullscreenchangeEvent = new Event("fullscreenchange", { bubbles: true });
    fullscreenchangeEvent.target = this;

    this.ownerDocument.dispatchEvent(fullscreenchangeEvent);
  }
  cloneNode(deep) {
    const $clone = this.$elm.clone();
    if (!deep) {
      $clone.empty();
    }
    return this._getElement($clone);
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
