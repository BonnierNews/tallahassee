"use strict";

const cheerio = require("cheerio");
const getHeaders = require("./getHeaders");
const getLocation = require("./getLocation");
const Url = require("url");
const vm = require("vm");
const {EventEmitter} = require("events");

module.exports = Document;

function Document(resp) {
  const location = getLocation(resp.request);
  let cookieHeader = getHeaders(resp).cookie || "";

  const $ = cheerio.load(resp.text, {decodeEntities: false});
  const loaded = [];
  const doc = MockElement($);
  doc.getElement = getElement;
  doc.$ = $;

  Object.defineProperty(doc, "head", {
    get: getHead
  });

  Object.defineProperty(doc, "body", {
    get: getBody
  });

  Object.defineProperty(doc, "cookie", {
    get: () => cookieHeader,
    set: (value) => {
      const parsedCookie = parseSetCookie.call(this, value);
      if (!parsedCookie.cookie) throw new Error(`Not a valid cookie: ${value}`);

      cookieHeader += parsedCookie.cookie;
    }
  });

  return doc;

  function getHead() {
    return doc.getElement($("head"));
  }

  function getBody() {
    return doc.getElement($("body"));
  }

  function getElement($elm) {
    if ($elm === $) return doc;

    let mockElement = loaded.find((mockedElm) => mockedElm.$elm[0] === $elm[0]);
    if (mockElement) {
      return mockElement;
    }

    mockElement = MockElement($elm);
    loaded.push(mockElement);
    return mockElement;
  }

  function MockElement($elm) {
    const tagName = $elm[0] && $elm[0].name;
    let top = 761, bottom = top + 760 * 2, height = bottom - top;
    const emitter = new EventEmitter();
    const listenEvents = [];

    const classList = getClassList();
    const element = {
      $elm,
      appendChild,
      classList,
      click,
      dispatchEvent,
      getAttribute,
      getElementById,
      getElementsByClassName,
      getElementsByTagName,
      insertAdjacentHTML,
      getBoundingClientRect,
      setBoundingClientRect,
      addEventListener,
      style: {},
      createElement,
      removeChild,
      runScripts,
      setAttribute,
      removeAttribute,
      _emitter: emitter,
      _listenEvents: listenEvents
    };

    function addEventListener(eventName, fn) {
      listenEvents.push(eventName);
      emitter.on(eventName, fn.bind(this));
    }

    Object.defineProperty(element, "firstElementChild", {
      get: getElementFirstChild
    });

    Object.defineProperty(element, "lastElementChild", {
      get: getElementLastChild
    });

    Object.defineProperty(element, "dataset", {
      get: getDataset
    });

    Object.defineProperty(element, "tagName", {
      get: () => tagName ? tagName.toUpperCase() : undefined
    });

    Object.defineProperty(element, "children", {
      get: getChildren
    });

    Object.defineProperty(element, "parentElement", {
      get: () => getElement($elm.parent())
    });

    Object.defineProperty(element, "innerText", {
      get: () => $elm.html()
    });

    Object.defineProperty(element, "href", {
      get: () => {
        const rel = getAttribute("href");
        if (!rel) return;
        if (!rel.startsWith("/")) return rel;

        return Url.format(Object.assign({}, location, {path: rel}));
      }
    });

    Object.defineProperty(element, "value", {
      get: () => {
        return getAttribute("value");
      },
      set: (value) => {
        return setAttribute("value", value);
      }
    });

    Object.defineProperty(element, "textContent", {
      get: () => $elm.html(),
      set: (value) => $elm.html(value)
    });

    Object.defineProperty(element, "checked", {
      get: () => {
        return getAttribute("checked") === "checked";
      },
      set: (value) => {
        const oldValue = (getAttribute("checked") === "checked");
        uncheckRadioButtons();

        if (value) {
          setAttribute("checked", "checked");
          if (!oldValue) {
            emitter.emit("change", emptyEvent());
          }
        }
      }
    });

    return element;

    function getElementFirstChild() {
      return doc.getElement(find("> :first-child"));
    }

    function getElementLastChild() {
      return doc.getElement(find("> :last-child"));
    }

    function toMockElement(idx, elm) {
      return doc.getElement($(elm));
    }

    function getElementsByClassName(query) {
      return find(`.${query}`).map(toMockElement).toArray();
    }

    function getElementsByTagName(query) {
      return find(`${query}`).map((idx, elm) => doc.getElement($(elm))).toArray();
    }

    function appendChild(childElement) {
      $elm.append(childElement.$elm.parent().html());
      if (childElement.$elm[0].tagName === "script") {
        vm.runInThisContext(childElement.innerText);
      }
    }

    function click() {
      emitter.emit("click", {
        preventDefault: () => {},
        stopPropagation: () => {}
      });
    }

    function dispatchEvent(...args) {
      emitter.emit(...args);
    }

    function getAttribute(name) {
      return $elm.attr(name);
    }

    function removeChild(childElement) {
      childElement.$elm.remove();
    }

    function find(selector) {
      if ($elm === $) {
        return $(selector);
      }
      return $elm.find(selector);
    }

    function getElementById(id) {
      const $idElm = $(`#${id}`).eq(0);

      if ($idElm) return doc.getElement($idElm);
    }

    function getDataset() {
      if (!$elm || !$elm[0] || !$elm[0].attribs) return {};
      const {attribs} = $elm[0];
      return Object.keys(attribs).reduce((acc, key) => {
        if (key.startsWith("data-")) {
          acc[key.replace(/^data-/, "").replace(/-(\w)/g, (a, b) => b.toUpperCase())] = attribs[key];
        }
        return acc;
      }, {});
    }

    function getChildren() {
      if (!$elm) return [];
      return $elm.children().map(toMockElement).toArray();
    }

    function insertAdjacentHTML(position, markup) {
      $elm.append(markup);
    }

    function setBoundingClientRect(setTop, setBottom) {
      top = setTop;

      if (setBottom === undefined) {
        bottom = top + height;
      } else {
        bottom = setBottom;
        height = bottom - top;
      }
    }

    function getBoundingClientRect() {
      return {
        top,
        bottom,
        height
      };
    }

    function createElement(elementTagName) {
      const elementDOM = Document({ text: `<${elementTagName}></${elementTagName}>` });
      return elementDOM.getElementsByTagName(elementTagName)[0];
    }

    function runScripts() {
      $("script").each((idx, elm) => {
        const scriptBody = $(elm).html();
        if (scriptBody) vm.runInThisContext(scriptBody);
      });
    }

    function setAttribute(name, val) {
      $elm.attr(name, val);
    }

    function removeAttribute(name) {
      $elm.removeAttr(name);
    }

    function uncheckRadioButtons() {
      if ($elm.attr("type") !== "radio") return;

      const name = $elm.attr("name");

      const $form = $elm.closest("form");
      if ($form && $form.length) {
        return $form.find(`input[type="radio"][name="${name}"]`).removeAttr("checked");
      }

      $(`input[type="radio"][name="${name}"]`).removeAttr("checked");
    }

    function emptyEvent() {
      let defaultPrevented;
      const event = {
        preventDefault,
        stopPropagation: () => {}
      };

      Object.defineProperty(event, "defaultPrevented", {
        get: () => defaultPrevented
      });

      return event;

      function preventDefault() {
        defaultPrevented = true;
      }
    }

    function getClassList() {
      if (!$elm.attr) return;

      const classListApi = {
        contains(className) {
          return $elm.hasClass(className);
        },
        add(...classNames) {
          $elm.addClass(classNames.join(" "));
        },
        remove(...classNames) {
          $elm.removeClass(classNames.join(" "));
        },
        toggle(className, force) {
          const hasClass = $elm.hasClass(className);

          if (force === undefined) {
            $elm.toggleClass(className);
            return !hasClass;
          }

          if (force) {
            $elm.addClass(className);
          } else {
            $elm.removeClass(className);
          }
          return !hasClass;
        }
      };

      Object.defineProperty(classListApi, "_classes", {
        get: getClassArray
      });

      return classListApi;

      function getClassArray() {
        return ($elm.attr("class") || "").split(" ");
      }
    }

  }
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
    this.setCookies[parsed.name] = parsed;
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

