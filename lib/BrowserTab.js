"use strict";

const {JSDOM, ResourceLoader, VirtualConsole} = require("jsdom");
const Fetch = require("./Fetch");
const Location = require("./Location");
const vm = require("vm");
const domOverrides = require("./domOverrides");

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

    const resourceLoader = new ResourceLoader({
      proxy: this[kResponse].url,
      userAgent: webPage.userAgent,
    });
    const virtualConsole = new VirtualConsole();
    virtualConsole.sendTo(console, {omitJSDOMErrors: true});
    const dom = new JSDOM(await resp.text(), {
      url: this.location,
      referrer: webPage.referrer,
      resources: resourceLoader,
      cookieJar: this.jar,
      virtualConsole,
      // runScripts: "dangerously",
      pretendToBeVisual: true,
      beforeParse: (window) => {
        domOverrides(window);
      }
    });

    dom.window.fetch = Fetch(webPage.fetch.bind(webPage));
    const window = this.window = dom.window;
    const document = this.document = window.document;

    this[pageOffsetSymbol].X = window.pageXOffset;
    this[pageOffsetSymbol].Y = window.pageYOffset;

    document.addEventListener("submit", this.onDocumentSubmit.bind(this));
    window.addEventListener("scroll", this.onWindowScroll.bind(this));

    return this;
  }
  _resize(newInnerWidth, newInnerHeight) {
    const windowSize = this.window;
    if (newInnerWidth !== undefined) {
      windowSize.innerWidth = newInnerWidth;
    }
    if (newInnerHeight !== undefined) {
      windowSize.innerHeight = newInnerHeight;
    }
    this.window.dispatchEvent(new this.window.Event("resize"));
  }
  focus() {}
  focusIframe(element) {
    if (!element) return;
    if (!element.tagName === "IFRAME") return;

    return element.contentWindow;
  }
  navigateTo(...args) {
    return this[webPageSymbol].navigateTo(...args);
  }
  runScript(script) {
    const scriptType = script.getAttribute("type");
    if (scriptType && !/(text|application)\/(javascript)/i.test(scriptType)) return;

    const scriptBody = script.innerHTML;
    if (scriptBody) vm.runInNewContext(scriptBody, this.window);
  }
  runScripts(context) {
    context = context || this.document.documentElement;

    const [...scripts] = context.getElementsByTagName("script");
    scripts.forEach((elm) => {
      const script = elm;
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
    this.scrollToTopOfElement(element, offsetFromBottom + offset);
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

    const {target: form, submitter} = event;
    const method = form.getAttribute("method") || "GET";
    const formaction = (submitter?.getAttribute("formaction")) || form.getAttribute("action");
    const action = formaction || this.window.location.pathname + (this.window.location.search ? this.window.location.search : "");

    const webPage = this[webPageSymbol];

    if (method.toUpperCase() === "GET") {
      const uri = new URL(action, this.window.location.origin);
      for (const [name, value] of new this.window.FormData(form).entries()) {
        uri.searchParams.append(name, value);
      }
      if (submitter?.name) uri.searchParams.append(submitter.name, submitter.value || "");
      return callback(webPage.submit(`${uri.pathname}${uri.search}`));
    } else if (method.toUpperCase() === "POST") {
      const payload = new URLSearchParams(new this.window.FormData(form));
      for (const [name, value] of payload) {
        if (!value) payload.delete(name);
      }
      if (submitter?.name) payload.append(submitter.name, submitter.value || "");

      const navigation = webPage.submit(action, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: payload.toString(),
      });
      return callback(navigation);
    }
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
