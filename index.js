"use strict";

const getHeaders = require("./lib/getHeaders");
const makeAbsolute = require("./lib/makeAbsolute");
const Request = require("request");
const supertest = require("supertest");
const url = require("url");
const vm = require("vm");
const {Document, Fetch, Window, Compiler} = require("./lib");
const {compile} = Compiler;

module.exports = Tallahassee;

function Tallahassee(app) {
  return {
    navigateTo,
    load,
  };

  function navigateTo(linkUrl, headers = {}, statusCode = 200) {
    const req = supertest(app).get(linkUrl);
    for (const key in headers) {
      req.set(key, headers[key]);
    }
    return req
      .expect("Content-Type", /text\/html/i)
      .expect(statusCode)
      .then(load);
  }

  function load(resp) {
    let initialized, pending, currentPageYOffset;
    let elementsToScroll = () => {};
    const stickedElements = [];

    compile();

    const headers = getHeaders(resp.request);
    const window = Window(resp, {
      fetch: Fetch(app, resp),
    });
    const document = Document(resp);
    window.document = document;

    const browserContext = {
      $: document.$,
      document,
      focus,
      focusIframe,
      runScripts,
      setElementsToScroll,
      scrollToBottomOfElement,
      scrollToTopOfElement,
      stickElementToTop,
      unstickElementFromTop,
      window,
      response: resp
    };

    Object.defineProperty(browserContext, "_pending", {
      get: () => pending
    });

    currentPageYOffset = window.pageYOffset;

    document.addEventListener("submit", onDocumentSubmit);
    window.addEventListener("scroll", onWindowScroll);

    focus();

    return browserContext;

    function focus() {
      if (initialized) {
        compile();
      }

      initialized = true;
      global.window = window;
      global.document = document;
    }

    function onDocumentSubmit(event) {
      if (event.target.tagName === "FORM") {
        pending = new Promise((resolve) => {
          process.nextTick(navigate, resolve);
        });
      }

      function navigate(resolve) {
        if (event.defaultPrevented) return resolve();

        const form = event.target;
        const qs = getFormInputAsQs(form);
        const p = url.parse(form.getAttribute("action"), true);
        Object.assign(p.query, qs);

        const navigation = navigateTo(url.format(p), {
          cookie: document.cookie
        });
        resolve(navigation);
      }
    }

    function runScripts(context) {
      context = context || document.documentElement;
      context.$elm.find("script").each((idx, elm) => {
        const $script = document.$(elm);
        const scriptType = $script.attr("type");
        if (scriptType && !/javascript/i.test(scriptType)) return;

        const scriptBody = $script.html();
        if (scriptBody) vm.runInThisContext(scriptBody);
      });
    }

    function setElementsToScroll(elmsToScrollFn) {
      elementsToScroll = elmsToScrollFn;
    }

    function onWindowScroll() {
      if (!elementsToScroll) return;
      const elms = elementsToScroll(document);
      if (!elms || !elms.length) return;

      const pageYOffset = window.pageYOffset;
      const delta = currentPageYOffset - pageYOffset;

      elms.slice().forEach((elm) => {
        if (isElementSticky(elm)) return;

        const {top, bottom} = elm.getBoundingClientRect();
        elm._setBoundingClientRect({
          top: (top || 0) + delta,
          bottom: (bottom || 0) + delta
        });
      });

      currentPageYOffset = pageYOffset;
    }

    function scrollToTopOfElement(element, offset = 0) {
      if (isElementSticky(element)) throw new Error("Cannot scroll to sticky element");

      const {top} = element.getBoundingClientRect();

      const pageYOffset = window.pageYOffset;
      let newYOffset = pageYOffset + top - offset;
      if (newYOffset < 0) newYOffset = 0;

      window.scroll(window.pageXOffset, newYOffset);
    }

    function scrollToBottomOfElement(element, offset = 0) {
      if (isElementSticky(element)) throw new Error("Cannot scroll to sticky element");
      const {height} = element.getBoundingClientRect();
      const offsetFromBottom = window.innerHeight - height;
      return scrollToTopOfElement(element, offsetFromBottom + offset);
    }

    function stickElementToTop(element) {
      if (isElementSticky(element)) return;

      const {top, height} = element.getBoundingClientRect();
      element._tallahasseePositionBeforeSticky = window.pageYOffset + top;
      element._setBoundingClientRect({
        top: 0,
        bottom: (height || 0)
      });
      stickedElements.push(element);
    }

    function unstickElementFromTop(element) {
      const idx = stickedElements.indexOf(element);
      if (idx < 0) return;
      stickedElements.splice(idx, 1);
      const top = element._tallahasseePositionBeforeSticky - window.pageYOffset;
      const {height} = element.getBoundingClientRect();
      element._setBoundingClientRect({
        top: top,
        bottom: height ? top + height : top
      });
      element._tallahasseePositionBeforeSticky = undefined;
    }

    function isElementSticky(element) {
      return stickedElements.indexOf(element) > -1;
    }

    async function focusIframe(element, src) {
      if (!element) return;
      if (!element.tagName === "IFRAME") return;

      src = src || element.src;

      const srcUrl = makeAbsolute(browserContext.window.location, src);
      const parsedUrl = url.parse(srcUrl);

      if (parsedUrl.host !== browserContext.window.location.host) return requestExternalContent(srcUrl);

      const iframeScope = await Tallahassee(app).navigateTo(parsedUrl.path, headers);
      iframeScope.window.frameElement = element;
      iframeScope.window.top = browserContext.window;

      return iframeScope;

      function requestExternalContent(externalUrl) {
        const prom = new Promise((resolve, reject) => {
          Request.get(externalUrl, (err, getResp) => {
            if (err) return reject(err);

            const {request, body: text} = getResp;
            const {href} = request;
            request.url = href;

            resolve({request, text});
          });
        });

        return prom.then((scopeResp) => {
          return Tallahassee(app).load(scopeResp);
        }).then((scopedBrowser) => {
          scopedBrowser.window.top = getLockedWindow(scopedBrowser.window.location.href);
          return scopedBrowser;
        });
      }
    }

    function getLockedWindow(frameSrc) {
      const lockedWindow = {};
      const location = {};

      const origin = url.parse(frameSrc);

      lockedWindow.location = new Proxy(location, {
        set: unauth,
        get: unauth,
        deleteProperty: unauth
      });

      return lockedWindow;

      function unauth() {
        throw new Error(`Blocked a frame with origin "${origin.protocol}//${origin.host}" from accessing a cross-origin frame.`);
      }
    }
  }
}

function getFormInputAsQs(form) {
  const inputs = form.getElementsByTagName("input");

  return inputs.reduce((acc, input) => {
    if (input.name && input.value) {
      if (input.type === "radio") {
        if (input.checked) {
          acc[input.name] = input.value;
        }
      } else {
        acc[input.name] = input.value;
      }
    }
    return acc;
  }, {});
}
