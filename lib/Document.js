"use strict";

const cheerio = require("cheerio");
const getHeaders = require("./getHeaders");
const getLocation = require("./getLocation");
const Element = require("./Element");

const {EventEmitter} = require("events");

module.exports = Document;

function Document(resp) {
  const location = getLocation(resp.request);
  let cookieHeader = getHeaders(resp.request).cookie || "";
  const setCookies = {};

  const $ = cheerio.load(resp.text, {decodeEntities: false});
  const loaded = [];

  const emitter = new EventEmitter();

  const document = {
    _getElement: getElement,
    _emitter: emitter,
    addEventListener,
    createElement,
    dispatchEvent,
    getElementById,
    getElementsByTagName,
    getElementsByClassName,
    location,
    removeEventListener,
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

  Object.defineProperty(document, "firstElementChild", {
    get: () => getElement($("html"))
  });

  Object.defineProperty(document, "firstChild", {
    get: () => getElement($("> :first-child"))
  });

  Object.defineProperty(document, "cookie", {
    get: () => cookieHeader,
    set: (value) => {
      const parsedCookie = parseSetCookie.call(this, value);
      if (!parsedCookie.cookie) throw new Error(`Not a valid cookie: ${value}`);

      cookieHeader += parsedCookie.cookie;
    }
  });

  Object.defineProperty(document, "title", {
    get: () => getElement($("head > title")).textContent,
    set: (value) => {
      getElement($("head > title")).textContent = value;
    }
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

  function getElementsByTagName(query) {
    return $(`${query}`).map((idx, elm) => getElement(document.$(elm))).toArray();
  }

  function getElementsByClassName(className) {
    return $(`.${className}`).map((idx, elm) => getElement(document.$(elm))).toArray();
  }

  function createElement(elementTagName) {
    const elementDOM = Document({ text: `<${elementTagName}></${elementTagName}>` });
    return elementDOM.getElementsByTagName(elementTagName)[0];
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

  function parseSetCookie(cookie) {
    const setCookiePattern = /^(\w+)=(.*?)(;(.*?))?$/g;
    const parsed = {};
    if (!/;$/.test(cookie)) cookie = `${cookie};`;

    cookie.trim().replace(setCookiePattern, (match, name, value, settings) => {
      parsed.cookie = `${name}=${value};`;
      parsed.name = name;
      parsed.value = decodeURIComponent(value);
      Object.assign(parsed, parseSettings(settings));
    });

    if (parsed.name) {
      setCookies[parsed.name] = parsed;
    }

    return parsed;
  }
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
