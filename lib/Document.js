"use strict";

const cheerio = require("cheerio");
const Element = require("./Element");
const getHeaders = require("./getHeaders");
const getLocation = require("./getLocation");

const {EventEmitter} = require("events");

module.exports = Document;

function Document(resp) {
  const location = getLocation(resp.request);
  const cookieHeader = getHeaders(resp.request).cookie || "";
  const referrer = getHeaders(resp.request).referer || "";
  const cookies = Cookies(cookieHeader);

  const $ = cheerio.load(resp.text, {decodeEntities: false});
  const loaded = [];

  const emitter = new EventEmitter();

  const document = {
    _getElement: getElement,
    _emitter: emitter,
    addEventListener,
    createDocumentFragment,
    createElement,
    createTextNode,
    dispatchEvent,
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

  Object.defineProperty(document, "cookie", {
    get: () => cookies.get(),
    set: (value) => {
      cookies.setCookie(value);
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

  function createDocumentFragment() {
    return Document({ text: "" }).body;
  }

  function createElement(elementTagName) {
    const elementDOM = Document({ text: `<${elementTagName}></${elementTagName}>` });
    return elementDOM.getElementsByTagName(elementTagName)[0];
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
    emitter.emit(...args);
  }

  function onFormSubmit(event) {
    emitter.emit("submit", event);
  }

  function importNode(element) {
    return Document({ text: element.$elm.html() }).body;
  }
}

function Cookies(cookie) {
  const setCookiePattern = /^(\w+)=(.*?)(;(.*?))?$/g;
  const cookies = loadCookies(cookie);
  const setCookies = {};

  return {
    setCookie,
    get
  };

  function get() {
    return Object.keys(cookies).reduce((result, name) => {
      const {value} = cookies[name];
      result += `${name}=${encodeURIComponent(value)};`;
      return result;
    }, "");
  }

  function loadCookies(cookieHeader) {
    const cookiesSplit = cookieHeader.split(";");
    return cookiesSplit.reduce((result, bar) => {
      const parts = bar.split("=");
      if (parts.length !== 2) return result;

      const name = parts.shift().trim();
      if (!name) return result;

      const value = decodeURIComponent(parts.shift().trim());
      result[name] = {name, value, cookie: bar};

      return result;
    }, {});
  }

  function setCookie(cookieString) {
    const parsed = {};
    if (!/;$/.test(cookieString)) cookieString = `${cookieString};`;

    cookieString.trim().replace(setCookiePattern, (match, name, value, settings) => {
      parsed.cookie = `${name}=${value};`;
      parsed.name = name;
      parsed.value = decodeURIComponent(value.trim());
      Object.assign(parsed, parseSettings(settings));
    });

    if (parsed.name) {
      cookies[parsed.name] = parsed;
      setCookies[parsed.name] = parsed;
    }

    return parsed;
  }

  function parseSettings(settings) {
    const settingsPattern = /(\w+)=(.*?)(;|$)/g;
    const parsed = {};

    settings.replace(settingsPattern, (match, name, value) => {
      if (name === "expires") value = new Date(value);
      parsed[name] = value;
    });

    return parsed;
  }
}
