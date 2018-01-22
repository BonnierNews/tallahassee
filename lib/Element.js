"use strict";

const Url = require("url");
const vm = require("vm");
const {EventEmitter} = require("events");

const rwProperties = ["id", "name", "type", "value", "src"];

module.exports = Element;

function Element(document, $elm) {
  const {$, location, _getElement} = document;
  const tagName = (($elm[0] && $elm[0].name) || "").toLowerCase();
  let top = 99999, bottom = top + 760 * 2, height = bottom - top;
  const emitter = new EventEmitter();
  const listenEvents = [];

  const classList = getClassList();
  const element = {
    $elm,
    _emitter: emitter,
    _listenEvents: listenEvents,
    addEventListener,
    appendChild,
    classList,
    click,
    dispatchEvent,
    getAttribute,
    getBoundingClientRect,
    getElementsByClassName,
    getElementsByTagName,
    hasAttribute,
    insertAdjacentHTML,
    remove,
    removeAttribute,
    removeChild,
    removeEventListener,
    runScripts,
    setAttribute,
    setBoundingClientRect,
    style: getStyle(),
  };

  Object.defineProperty(element, "tagName", {
    get: () => tagName ? tagName.toUpperCase() : undefined
  });

  rwProperties.forEach((p) => {
    Object.defineProperty(element, p, {
      get: () => getAttribute(p),
      set: (value) => setAttribute(p, value)
    });
  });

  Object.defineProperty(element, "firstChild", {
    get: getFirstChild
  });

  Object.defineProperty(element, "firstElementChild", {
    get: getFirstChildElement
  });

  Object.defineProperty(element, "lastChild", {
    get: getLastChild
  });

  Object.defineProperty(element, "lastElementChild", {
    get: getLastChildElement
  });

  Object.defineProperty(element, "dataset", {
    get: getDataset
  });

  Object.defineProperty(element, "children", {
    get: getChildren
  });

  Object.defineProperty(element, "parentElement", {
    get: () => _getElement($elm.parent())
  });

  Object.defineProperty(element, "innerHTML", {
    get: () => $elm.html(),
    set: (value) => $elm.html(value)
  });

  Object.defineProperty(element, "innerText", {
    get: () => $elm.html()
  });

  Object.defineProperty(element, "textContent", {
    get: () => {
      return tagName === "script" ? $elm.html() : $elm.text();
    },
    set: (value) => {
      return tagName === "script" ? $elm.html(value) : $elm.text(value);
    }
  });

  Object.defineProperty(element, "outerHTML", {
    get: () => {
      return $.html($elm);
    },
    set: (value) => {
      $elm.replaceWith($(value));
    }
  });

  Object.defineProperty(element, "href", {
    get: () => {
      const rel = getAttribute("href");
      if (!rel) return;
      if (!rel.startsWith("/")) return rel;

      return Url.format(Object.assign({}, location, {pathname: rel, path: rel}));
    },
    set: (value) => {
      setAttribute("href", value);
    }
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

  Object.defineProperty(element, "disabled", {
    get: () => {
      const value = getAttribute("disabled");
      if (value === undefined) {
        if (!["input", "button"].includes(tagName)) return;
      }
      return value === "disabled";
    },
    set: (value) => {
      if (value === true) return setAttribute("disabled", "disabled");
      $elm.removeAttr("disabled");
    }
  });

  Object.defineProperty(element, "form", {
    get: () => _getElement($elm.closest("form"))
  });

  if (tagName === "form") {
    element.submit = submit;
  }

  return element;

  function addEventListener(eventName, fn) {
    listenEvents.push(eventName);
    emitter.on(eventName, fn);
  }

  function removeEventListener(eventName, fn) {
    const index = listenEvents.indexOf(eventName);
    if (index > -1) {
      listenEvents.splice(index, 1);
    }
    emitter.removeListener(eventName, fn);
  }

  function getFirstChildElement() {
    const firstChild = find("> :first-child");
    if (!firstChild.length) return null;
    return _getElement(firstChild);
  }

  function getLastChildElement() {
    const lastChild = find("> :last-child");
    if (!lastChild.length) return null;
    return _getElement(find("> :last-child"));
  }

  function getFirstChild() {
    const firstChild = $elm[0].children[0];
    if (!firstChild) return null;
    if (firstChild.type === "text") return firstChild.data;
    return getFirstChildElement();
  }

  function getLastChild() {
    const elmChildren = $elm[0].children;
    if (!elmChildren.length) return null;
    const lastChild = elmChildren[elmChildren.length - 1];
    if (lastChild.type === "text") return lastChild.data;
    return getLastChildElement();
  }

  function getElementsByClassName(query) {
    return find(`.${query}`).map(toElement).toArray();
  }

  function getElementsByTagName(query) {
    return find(`${query}`).map((idx, elm) => _getElement($(elm))).toArray();
  }

  function appendChild(childElement) {
    $elm.append(childElement.$elm.parent().html());
    if (childElement.$elm[0].tagName === "script") {
      vm.runInThisContext(childElement.innerText);
    }
  }

  function click() {
    const clickEvent = emptyEvent();
    emitter.emit("click", clickEvent);

    if (!clickEvent.defaultPrevented && element.form) {
      if (element.type === "submit") element.form.submit();
    }
  }

  function dispatchEvent(...args) {
    emitter.emit(...args);
  }

  function getAttribute(name) {
    return $elm.attr(name);
  }

  function hasAttribute(name) {
    return $elm.is(`[${name}]`);
  }

  function removeChild(childElement) {
    childElement.$elm.remove();
  }

  function remove() {
    $elm.remove();
  }

  function find(selector) {
    return $elm.find(selector);
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
    return $elm.children().map(toElement).toArray();
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

  function runScripts() {
    $elm.find("script").each((idx, elm) => {
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

  function toElement(idx, elm) {
    return _getElement($(elm));
  }

  function submit() {
    const submitEvent = emptyEvent();
    emitter.emit("submit", submitEvent);
  }

  function emptyEvent() {
    let defaultPrevented;
    const event = {
      target: element,
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

  function getStyle() {
    const elementStyle = getAttribute("style") || "";
    const Style = {};
    if (elementStyle) {
      elementStyle.replace(/\s*(.+?):\s*(.*?)(;|$)/g, (_, name, value) => {
        Style[name] = value;
      });
    }

    Object.defineProperty(Style, "removeProperty", {
      enumerable: false,
      value: removeProperty
    });

    const StyleHandler = {
      set: (target, name, value) => {
        if (!name) return false;
        target[name] = value;
        setStyle();
        return true;
      },
      deleteProperty: (target, name) => {
        if (!name) return false;
        delete target[name];
        setStyle();
        return true;
      }
    };

    return new Proxy(Style, StyleHandler);

    function removeProperty(name) {
      delete Style[name];
      setStyle();
    }

    function setStyle() {
      const keys = Object.keys(Style);
      if (!keys.length) return removeAttribute("style");
      const styleValue = keys.reduce((result, key) => {
        const value = Style[key];
        if (value) result += `${key}: ${value};`;
        return result;
      }, "");

      if (!styleValue) return removeAttribute("style");
      setAttribute("style", styleValue);
    }
  }
}
