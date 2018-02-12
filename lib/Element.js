"use strict";

const makeAbsolute = require("./makeAbsolute");
const vm = require("vm");
const {EventEmitter} = require("events");

const rwProperties = ["id", "name", "type", "value"];

module.exports = Element;

function Element(document, $elm) {
  const {$, location, _getElement} = document;
  const tagName = (($elm[0] && $elm[0].name) || "").toLowerCase();

  const rects = {
    top: 99999,
    bottom: 99999,
    right: 0,
    left: 0,
    height: 0,
    width: 0
  };

  rects.bottom = rects.top + rects.height;

  const emitter = new EventEmitter();
  const listenEvents = [];

  const classList = getClassList();
  const element = {
    $elm,
    _emitter: emitter,
    _listenEvents: listenEvents,
    _setBoundingClientRect: setBoundingClientRect,
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
    setAttribute,
    style: getStyle(),
  };

  Object.setPrototypeOf(element, Element.prototype);

  if (tagName === "video") {
    element.play = () => {
      return Promise.resolve(undefined);
    };
    element.pause = () => {
      return undefined;
    };
  }

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
      return makeAbsolute(location, rel);
    },
    set: (value) => {
      setAttribute("href", value);
    }
  });

  Object.defineProperty(element, "src", {
    get: () => {
      const rel = getAttribute("src");
      return makeAbsolute(location, rel);
    },
    set: (value) => {
      setAttribute("src", value);
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

  Object.defineProperty(element, "offsetHeight", {
    get: () => getBoundingClientRect().height
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

  function setBoundingClientRect(axes) {
    for (const axis in axes) {
      rects[axis] = axes[axis];
    }

    rects.height = rects.bottom - rects.top;
    rects.width = rects.right - rects.left;

    return rects;
  }

  function getBoundingClientRect() {
    return rects;
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
        element._emitter.emit("_classadded", ...classNames);
      },
      remove(...classNames) {
        $elm.removeClass(classNames.join(" "));
        element._emitter.emit("_classremoved", ...classNames);
      },
      toggle(className, force) {
        const hasClass = $elm.hasClass(className);

        if (force === undefined) {
          const methodName = this.contains(className) ? "remove" : "add";
          this[methodName](className);
          return !hasClass;
        }

        if (force) {
          this.add(className);
        } else {
          this.remove(className);
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
    const prefixNamePattern = /^(-?)(moz|ms|webkit)([A-Z]|\1)/;

    const Style = {};
    if (elementStyle) {
      elementStyle.replace(/\s*(.+?):\s*(.*?)(;|$)/g, (_, name, value) => {
        let ccName = name.replace(prefixNamePattern, (__, isPrefix, prefix, suffix) => {
          return prefix + suffix;
        });
        ccName = ccName.replace(/-(\w)(\w+)/g, (__, firstLetter, rest) => `${firstLetter.toUpperCase()}${rest}`);
        Style[ccName] = value;
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
      const styleValue = keys.reduce((result, name) => {
        const value = Style[name];
        if (value === undefined || value === "") return result;

        let kcName = name.replace(prefixNamePattern, (__, isPrefix, prefix, suffix) => {
          return `-${prefix}${suffix}`;
        });

        kcName = kcName.replace(/([A-Z])([a-z]+)/g, (__, firstLetter, rest) => `-${firstLetter.toLowerCase()}${rest}`);

        result += `${kcName}: ${value};`;
        return result;
      }, "");

      if (!styleValue) return removeAttribute("style");
      setAttribute("style", styleValue);
    }
  }
}
