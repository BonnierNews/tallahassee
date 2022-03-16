"use strict";

const Document = require("./Document");
const Fetch = require("./Fetch");
const Location = require("./Location");
const querystring = require("querystring");
const vm = require("vm");
const Window = require("./Window");
const url = require("url");

const webPageSymbol = Symbol.for("webPage");
const kResponse = Symbol.for("response");
const pendingSymbol = Symbol.for("pending");
const elementsToScrollSymbol = Symbol.for("elementsToScroll");
const stuckElementsSymbol = Symbol.for("stickedElements");
const originalTopPositionSymbol = Symbol.for("originalTopPosition");
const pageOffsetSymbol = Symbol.for("pageOffset");

module.exports = class BrowserTab {
  constructor(webPage, resp) {
    this[webPageSymbol] = webPage;
    this[kResponse] = resp;
    this.location = new Location(null, resp.url);
    this[pendingSymbol] = null;
    this[pageOffsetSymbol] = {X: 0, Y: 0};
    this[stuckElementsSymbol] = [];
    this.navigateTo = this.navigateTo.bind(this);
  }
  get $() {
    return this.document.$;
  }
  get jar() {
    return this[webPageSymbol].jar;
  }
  get response() {
    return this[kResponse];
  }
  get _pending() {
    return this[pendingSymbol];
  }
  async load() {
    const webPage = this[webPageSymbol];
    const resp = this[kResponse];

    const document = this.document = new Document({
      text: await resp.text(),
      location: this.location,
      referrer: webPage.referrer,
    }, this.jar);

    const window = this.window = new Window(resp, {
      fetch: Fetch(webPage.fetch.bind(webPage)),
      get document() {
        return document;
      },
    }, webPage.userAgent);

    Object.defineProperty(document, "_window", {
      get() {
        return window;
      }
    });

    this[pageOffsetSymbol].X = window.pageXOffset;
    this[pageOffsetSymbol].Y = window.pageYOffset;

    document.addEventListener("submit", this.onDocumentSubmit.bind(this));
    window.addEventListener("scroll", this.onWindowScroll.bind(this));

    return this;
  }
  focus() {}
  async focusIframe(element, src) {
    if (!element) return;
    if (!element.tagName === "IFRAME") return;

    src = src || element.src;

    const parsedSrc = new URL(src, this.window.location.origin);
    const srcUri = parsedSrc.hostname === this.window.location.hostname ? element.getAttribute("src") : parsedSrc.toString();

    const iframeScope = await this[webPageSymbol].load(srcUri);

    if (iframeScope.window.location.hostname === this.window.location.hostname) {
      iframeScope.window.frameElement = element;
      iframeScope.window.top = this.window;
    } else {
      iframeScope.window.top = getLockedWindow(iframeScope.window.location.href);
    }

    return iframeScope;
  }
  navigateTo(...args) {
    return this[webPageSymbol].load(...args);
  }
  runScript(script) {
    const $script = script.$elm;

    const scriptType = $script.attr("type");
    if (scriptType && !/(text|application)\/(javascript)/i.test(scriptType)) return;

    const scriptBody = $script.html();
    if (scriptBody) vm.runInNewContext(scriptBody, this.window);
  }
  runScripts(context) {
    context = context || this.document.documentElement;

    context.$elm.find("script").each((idx, elm) => {
      const script = this.document._getElement(this.document.$(elm));
      this.runScript(script);
    });
  }
  setElementsToScroll(elmsToScrollFn) {
    this[elementsToScrollSymbol] = elmsToScrollFn;
  }
  scrollToBottomOfElement(element, offset = 0) {
    if (this.isElementSticky(element)) throw new Error("Cannot scroll to sticky element");
    const {height} = element.getBoundingClientRect();
    const offsetFromBottom = this.window.innerHeight - height;
    return this.scrollToTopOfElement(element, offsetFromBottom + offset);
  }
  scrollToTopOfElement(element, offset = 0) {
    if (this.isElementSticky(element)) throw new Error("Cannot scroll to sticky element");

    const {top} = element.getBoundingClientRect();

    const pageYOffset = this.window.pageYOffset;
    let newYOffset = pageYOffset + top - offset;
    if (newYOffset < 0) newYOffset = 0;

    this.window.scroll(this.window.pageXOffset, newYOffset);
  }
  stickElementToTop(element) {
    if (this.isElementSticky(element)) return;

    const {top, height} = element.getBoundingClientRect();
    element[originalTopPositionSymbol] = this.window.pageYOffset + top;
    element._setBoundingClientRect({
      top: 0,
      bottom: (height || 0)
    });
    this[stuckElementsSymbol].push(element);
  }
  unstickElementFromTop(element) {
    const stuckElements = this[stuckElementsSymbol];
    const idx = stuckElements.indexOf(element);
    if (idx < 0) return;
    stuckElements.splice(idx, 1);
    const top = element[originalTopPositionSymbol] - this.window.pageYOffset;
    const {height} = element.getBoundingClientRect();
    element._setBoundingClientRect({
      top: top,
      bottom: height ? top + height : top
    });
    delete element[originalTopPositionSymbol];
  }
  isElementSticky(element) {
    return this[stuckElementsSymbol].indexOf(element) > -1;
  }
  onDocumentSubmit(event) {
    if (event.target.tagName !== "FORM") return;

    this[pendingSymbol] = new Promise((resolve) => {
      process.nextTick(this.submitFormEvent.bind(this), event, resolve);
    });
  }
  submitFormEvent(event, callback) {
    if (event.defaultPrevented) return callback();

    const form = event.target;
    const method = form.getAttribute("method") || "GET";
    const formaction = (event._submitElement && event._submitElement.getAttribute("formaction")) || form.getAttribute("action");
    const action = formaction || this.window.location.pathname + (this.window.location.search ? this.window.location.search : "");

    const formData = this.getFormData(form, event._submitElement);
    const webPage = this[webPageSymbol];

    if (method.toUpperCase() === "GET") {
      const p = url.parse(action, true);
      Object.assign(p.query, formData);
      return callback(webPage.submit(url.format(p)));
    } else if (method.toUpperCase() === "POST") {
      const navigation = webPage.submit(action, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: querystring.stringify(formData),
      });
      return callback(navigation);
    }
  }
  getFormData(form, submitElement) {
    const inputs = form.elements;

    const payload = inputs.reduce((acc, input) => {
      if (input.disabled) return acc;

      if (input.name && input.value) {
        if (input.type === "radio" || input.type === "checkbox") {
          if (input.checked) {
            acc[input.name] = acc[input.name] || [];
            acc[input.name].push(input.value);
          }
        } else if (input.tagName === "SELECT") {
          const selected = input.selectedOptions;

          if (selected.length === 1) {
            acc[input.name] = selected[0].value;
          } else if (selected.length > 1) {
            acc[input.name] = Array.from(selected).map((option) => option.value);
          }
        } else {
          acc[input.name] = input.value;
        }
      }
      return acc;
    }, {});

    if (submitElement && submitElement.name) {
      payload[submitElement.name] = submitElement.value;
    }

    return payload;
  }
  onWindowScroll() {
    const elementsToScroll = this[elementsToScrollSymbol];
    if (!elementsToScroll) return;
    const elms = elementsToScroll(this.document);
    if (!elms || !elms.length) return;

    const pageOffset = this[pageOffsetSymbol];
    const {pageXOffset, pageYOffset} = this.window;
    const deltaX = pageOffset.X - pageXOffset;
    const deltaY = pageOffset.Y - pageYOffset;

    for (const elm of elms) {
      if (this.isElementSticky(elm)) continue;
      const {left, right, top, bottom} = elm.getBoundingClientRect();
      elm._setBoundingClientRect({
        left: (left || 0) + deltaX,
        right: (right || 0) + deltaX,
        top: (top || 0) + deltaY,
        bottom: (bottom || 0) + deltaY,
      });
    }

    pageOffset.X = pageXOffset;
    pageOffset.Y = pageYOffset;
  }
};

function getLockedWindow(frameSrc) {
  const lockedWindow = {};
  const frameOrigin = new URL(frameSrc);

  lockedWindow.location = new Proxy({}, {
    set: unauth,
    get: unauth,
    deleteProperty: unauth
  });

  return lockedWindow;

  function unauth() {
    throw new Error(`Blocked a frame with origin "${frameOrigin.protocol}//${frameOrigin.host}" from accessing a cross-origin frame.`);
  }
}
