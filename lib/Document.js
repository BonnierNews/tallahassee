"use strict";

const cheerio = require("cheerio");
const getHeaders = require("./getHeaders");
const getLocation = require("./getLocation");
const Element = require("./Element");

const {EventEmitter} = require("events");

module.exports = Document;

function Document(resp) {
  const location = getLocation(resp.request);
  let cookieHeader = getHeaders(resp).cookie || "";
  const setCookies = {};

  const $ = cheerio.load(resp.text, {decodeEntities: false});
  const loaded = [];
  const document = Object.assign(new EventEmitter(), {
    createElement,
    getElementById,
    getElementsByTagName,
    getElementsByClassName,
    location,
    textContent: null,
    $,
    _getElement: getElement,
  });

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

  return document;

  function getHead() {
    return getElement($("head"));
  }

  function getBody() {
    return getElement($("body"));
  }

  function getElement($elm) {
    if ($elm === $) return document;

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

