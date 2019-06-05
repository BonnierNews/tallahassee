"use strict";

const querystring = require("querystring");
const getHeaders = require("./lib/getHeaders");
const makeAbsolute = require("./lib/makeAbsolute");
const Request = require("request");
const supertest = require("supertest");
const url = require("url");
const vm = require("vm");
const {Document, Fetch, Window} = require("./lib");
const assert = require("assert");

module.exports = Tallahassee;

function Tallahassee(app, options = {}) {
  const agent = supertest.agent(app);
  const forwardedHostHeader = options.headers && Object.entries(options.headers).find((entry) => entry[0].toLowerCase() === "x-forwarded-host");

  const localAppHost = options.headers && ((forwardedHostHeader && forwardedHostHeader[1]) || options.headers.host);
  return {
    jar: agent.jar,
    navigateTo,
    load,
  };

  function navigateTo(linkUrl, headers = {}, statusCode = 200) {
    if (options.headers) {
      headers = {
        ...options.headers,
        ...headers,
      };
    }

    let numRedirects = 0;
    for (const key in headers) {
      if (key.toLowerCase() === "cookie") {
        agent.jar.setCookies(headers[key].split(";").map((c) => c.trim()).filter(Boolean), localAppHost);
      }
    }

    return makeRequest(linkUrl)
      .then((resp) => {
        assert.equal(resp.statusCode, statusCode, `Unexepected status code. Expected: ${statusCode}. Actual: ${resp.statusCode}`);
        assert(resp.headers["content-type"].match(/text\/html/i), `Unexepected content type. Expected: text/html. Actual: ${resp.headers["content-type"]}`);
        return resp;
      })
      .then(load);

    function makeRequest(reqUrl) {
      let request;
      const parsedUrl = url.parse(reqUrl);

      if (parsedUrl.host && parsedUrl.host !== (localAppHost || headers.host)) {
        request = new Promise((resolve, reject) => {
          Request.get(reqUrl, { followRedirect: false }, (externalReqErr, externalReqRes) => {
            if (externalReqErr) {
              return reject(externalReqErr);
            }
            return resolve(externalReqRes);
          });
        });
      } else {
        if (parsedUrl.host) {
          reqUrl = reqUrl.replace(`${parsedUrl.protocol}//${parsedUrl.host}`, "");
        }
        request = agent.get(reqUrl).redirects(0);
        for (const key in headers) {
          if (key.toLowerCase() !== "cookie") {
            request.set(key, headers[key]);
          }
        }
      }

      return request.then((res) => {
        if (res.statusCode > 300 && res.statusCode < 308) {
          numRedirects++;
          if (numRedirects > 20) {
            throw new Error("Too many redirects");
          }
          return makeRequest(res.headers.location);
        }
        return res;
      });
    }
  }

  function load(resp) {
    let pending, currentPageXOffset, currentPageYOffset;
    let elementsToScroll = () => {};
    const stickedElements = [];

    const headers = getHeaders(resp.request);
    const document = Document(resp, agent.jar);
    const window = Window(resp, {
      fetch: Fetch(agent, resp),
      get document() {
        return document;
      },
    });

    Object.defineProperty(document, "window", {
      get() {
        return window;
      }
    });

    const browserContext = {
      $: document.$,
      document,
      focus,
      focusIframe,
      navigateTo,
      runScript,
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

    currentPageXOffset = window.pageXOffset;
    currentPageYOffset = window.pageYOffset;

    document.addEventListener("submit", onDocumentSubmit);
    window.addEventListener("scroll", onWindowScroll);

    focus();

    return browserContext;

    function focus() {
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
        const method = form.getAttribute("method") || "GET";
        const formaction = (event._submitElement && event._submitElement.getAttribute("formaction")) || form.getAttribute("action");
        const action = formaction || window.location.pathname + (window.location.search ? window.location.search : "");
        const submitHeaders = {...options.headers, ...headers, cookie: agent.jar.getCookies({path: action}).toValueString()};

        const formData = getFormData(form, event._submitElement);

        if (method.toUpperCase() === "GET") {
          const p = url.parse(action, true);
          Object.assign(p.query, formData);

          const navigation = navigateTo(url.format(p), submitHeaders);
          resolve(navigation);
        } else if (method.toUpperCase() === "POST") {
          if (action.startsWith("/") || url.parse(action).host === localAppHost) {
            agent.post(url.parse(action).path)
              .set(submitHeaders)
              .set("Content-Type", "application/x-www-form-urlencoded")
              .send(querystring.stringify(formData))
              .then((postResp) => {
                if ([301, 302].includes(postResp.statusCode)) return navigateTo(postResp.headers.location);
                return load(postResp);
              })
              .then(resolve);
          } else {

            Request.post(action, {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              body: querystring.stringify(formData)
            }, (err, res) => {
              if (err) {
                throw err;
              }
              resolve(load(res));
            });
          }
        }
      }
    }

    function runScript(script) {
      const $script = script.$elm;

      const scriptType = $script.attr("type");
      if (scriptType && !/javascript/i.test(scriptType)) return;

      const scriptBody = $script.html();
      if (scriptBody) vm.runInNewContext(scriptBody, window);
    }

    function runScripts(context) {
      context = context || document.documentElement;

      context.$elm.find("script").each((idx, elm) => {
        const script = document._getElement(document.$(elm));

        runScript(script);
      });
    }

    function setElementsToScroll(elmsToScrollFn) {
      elementsToScroll = elmsToScrollFn;
    }

    function onWindowScroll() {
      if (!elementsToScroll) return;
      const elms = elementsToScroll(document);
      if (!elms || !elms.length) return;

      const {pageXOffset, pageYOffset} = window;
      const deltaX = currentPageXOffset - pageXOffset;
      const deltaY = currentPageYOffset - pageYOffset;

      for (const elm of elms) {
        if (isElementSticky(elm)) continue;
        const {left, right, top, bottom} = elm.getBoundingClientRect();
        elm._setBoundingClientRect({
          left: (left || 0) + deltaX,
          right: (right || 0) + deltaX,
          top: (top || 0) + deltaY,
          bottom: (bottom || 0) + deltaY,
        });
      }

      currentPageXOffset = pageXOffset;
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

      const iframeScope = await navigateTo(parsedUrl.path, headers);
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

function getFormData(form, submitElement) {
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
          acc[input.name] = selected.map((option) => option.getAttribute("value"));
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
