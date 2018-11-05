"use strict";

const cheerio = require("cheerio");
const {CustomEvent} = require("./Events");
const Element = require("./Element");
const DocumentFragment = require("./DocumentFragment");
const getHeaders = require("./getHeaders");
const getLocation = require("./getLocation");

const {EventEmitter} = require("events");

module.exports = Document;

function Document(resp, cookieJar) {
  const location = getLocation(resp.request);
  const referrer = getHeaders(resp.request).referer || "";

  const $ = cheerio.load(resp.text, {decodeEntities: false});
  const loaded = [];

  const emitter = new EventEmitter();

  let fullscreenElement = null;

  const document = {
    _getElement: getElement,
    _emitter: emitter,
    addEventListener,
    createDocumentFragment() {
      return DocumentFragment(Element);
    },
    createElement,
    createElementNS,
    createTextNode,
    dispatchEvent,
    exitFullscreen,
    getElementById,
    getElementsByTagName,
    getElementsByClassName,
    importNode,
    location,
    removeEventListener,
    referrer,
    textContent: null,
    $,
  };

  preloadForms();

  Object.defineProperty(document, "head", {
    get: getHead
  });

  Object.defineProperty(document, "body", {
    get: getBody
  });

  Object.defineProperty(document, "documentElement", {
    get: () => getElement($("html"))
  });

  Object.defineProperty(document, "firstElementChild", {
    get: () => getElement($("html"))
  });

  Object.defineProperty(document, "firstChild", {
    get: () => getElement($("> :first-child"))
  });

  Object.defineProperty(document, "fullscreenElement", {
    get: () => fullscreenElement
  });

  Object.defineProperty(document, "cookie", {
    get: () => cookieJar.getCookies({ path: "/", script: true, domain: location.host }).toValueString(),
    set: (value) => {
      cookieJar.setCookie(value);
    }
  });

  Object.defineProperty(document, "title", {
    get: () => getElement($("head > title")).textContent,
    set: (value) => {
      getElement($("head > title")).textContent = value;
    }
  });

  Object.defineProperty(document, "nodeType", {
    get: () => 9
  });

  return document;

  function exitFullscreen() {
    const fullscreenchangeEvent = new CustomEvent("fullscreenchange");
    fullscreenchangeEvent.target = fullscreenElement;

    document.dispatchEvent(fullscreenchangeEvent);
  }

  function getHead() {
    return getElement($("head"));
  }

  function getBody() {
    return getElement($("body"));
  }

  function getElement($elm) {
    if ($elm === $) return document;
    if (!$elm.length) return;

    let mockElement = loaded.find((mockedElm) => mockedElm.$elm[0] === $elm[0]);
    if (mockElement) {
      return mockElement;
    }

    mockElement = Element(document, $elm);

    loaded.push(mockElement);
    return mockElement;
  }

  function getElementById(id) {
    const $idElm = $(`#${id}`).eq(0);

    if ($idElm && $idElm.length) return getElement($idElm);
    return null;
  }

  function getElementsByTagName(tagName) {
    return $(`${tagName}`).map((idx, elm) => getElement(document.$(elm))).toArray();
  }

  function getElementsByClassName(className) {
    return $(`.${className}`).map((idx, elm) => getElement(document.$(elm))).toArray();
  }

  function createElement(elementTagName) {
    const elementDOM = Document({ text: `<${elementTagName}></${elementTagName}>` });
    return elementDOM.getElementsByTagName(elementTagName)[0];
  }

  function createElementNS(namespaceURI, elementTagName) {
    return createElement(elementTagName);
  }

  function createTextNode(text) {
    return {
      textContent: text,
    };
  }

  function preloadForms() {
    const forms = getElementsByTagName("form");
    for (let i = 0; i < forms.length; i++) {
      forms[i].addEventListener("submit", onFormSubmit);
    }
  }

  function addEventListener(...args) {
    emitter.on(...args);
  }

  function removeEventListener(...args) {
    emitter.removeListener(...args);
  }

  function dispatchEvent(...args) {
    if (args[0] && args[0].type === "fullscreenchange") {
      _handleFullscreenChange(args[0]);
    } else {
      emitter.emit(...args);
    }
  }

  function _handleFullscreenChange(event) {
    if (!event.target) return;

    if (fullscreenElement === null) {
      fullscreenElement = event.target;
    } else if (fullscreenElement === event.target) {
      fullscreenElement = null;
    }

    emitter.emit("fullscreenchange", event);
  }

  function onFormSubmit(event) {
    emitter.emit("submit", event);
  }

  function importNode(element, deep) {
    if (element instanceof DocumentFragment) {
      return element._clone(deep);
    }

    return element.cloneNode(deep);
  }
}
