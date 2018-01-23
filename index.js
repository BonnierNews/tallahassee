"use strict";

const supertest = require("supertest");
const url = require("url");
const {Document, Fetch, Window, Compiler} = require("./lib");
const {compile} = Compiler;

module.exports = Tallahassee;

function Tallahassee(app) {
  return {
    navigateTo,
    load,
  };

  function navigateTo(linkUrl, headers = {}) {
    const req = supertest(app).get(linkUrl);
    for (const key in headers) {
      req.set(key, headers[key]);
    }
    return req
      .expect("Content-Type", /text\/html/i)
      .expect(200)
      .then(load);
  }

  function load(resp) {
    let pending, currentPageYOffset;
    let elementsToScroll = () => {};

    compile();

    const window = Window(resp, {
      fetch: Fetch(app, resp),
    });
    const document = Document(resp);

    const browserContext = {
      $: document.$,
      document,
      setElementsToScroll,
      scrollToBottomOfElement,
      scrollToTopOfElement,
      window,
    };

    Object.defineProperty(browserContext, "_pending", {
      get: () => pending
    });

    global.window = window;
    window.document = document;
    global.document = document;

    currentPageYOffset = window.pageYOffset;

    document.addEventListener("submit", onDocumentSubmit);
    window.addEventListener("scroll", onWindowScroll);

    return browserContext;

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
        const {top} = elm.getBoundingClientRect();
        elm._setBoundingClientRect((top || 0) + delta);
      });

      currentPageYOffset = pageYOffset;
    }

    function scrollToTopOfElement(element, offset = 0) {
      const {top} = element.getBoundingClientRect();

      const pageYOffset = window.pageYOffset;
      window.scroll(0, pageYOffset + top - offset);
    }

    function scrollToBottomOfElement(element, offset = 0) {
      const {height} = element.getBoundingClientRect();
      const offsetFromBottom = window.innerHeight - height;
      return scrollToTopOfElement(element, offsetFromBottom + offset);
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
