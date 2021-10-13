"use strict";

const cheerio = require("cheerio");
const DocumentFragment = require("./DocumentFragment");
const {elementFactory} = require("./Element");
const getLocation = require("./getLocation");
const {EventEmitter} = require("events");
const {Event} = require("./Events");
const {HTMLCollection} = require("./HTMLCollection");

const cookieJarSymbol = Symbol.for("cookieJar");
const dollarSymbol = Symbol.for("$");
const loadedSymbol = Symbol.for("loaded");
const locationSymbol = Symbol.for("location");
const referrerSymbol = Symbol.for("referrer");
const emitterSymbol = Symbol.for("emitter");
const fullscreenElementSymbol = Symbol.for("fullscreenElement");

class Document {
  constructor(source, cookieJar) {
    this[locationSymbol] = source.location || getLocation(source.url);
    this[referrerSymbol] = source.referrer || "";
    this[dollarSymbol] = cheerio.load(source.text, {decodeEntities: false});
    this[cookieJarSymbol] = cookieJar;
    this[loadedSymbol] = [];
    this[emitterSymbol] = new EventEmitter();
    this[fullscreenElementSymbol] = null;
  }
  get _emitter() {
    return this[emitterSymbol];
  }
  get $() {
    return this[dollarSymbol];
  }
  get documentElement() {
    return this._getElement(this[dollarSymbol]("html"));
  }
  get location() {
    return this[locationSymbol];
  }
  get referrer() {
    return this[referrerSymbol];
  }
  get textContent() {
    return null;
  }
  get head() {
    return this._getElement(this[dollarSymbol]("head"));
  }
  get body() {
    return this._getElement(this[dollarSymbol]("body"));
  }
  get firstElementChild() {
    return this.documentElement;
  }
  get firstChild() {
    return this._getElement(this[dollarSymbol]("> :first-child"));
  }
  get fullscreenElement() {
    return this[fullscreenElementSymbol];
  }
  get cookie() {
    return this[cookieJarSymbol].getCookies({
      path: this.location.pathname,
      script: true,
      domain: this.location.hostname,
      secure: this.location.protocol === "https:",
    }).toValueString();
  }
  set cookie(value) {
    this[cookieJarSymbol].setCookie(value);
  }
  get title() {
    return this._getElement(this[dollarSymbol]("head > title")).textContent;
  }
  set title(value) {
    this._getElement(this[dollarSymbol]("head > title")).textContent = value;
  }
  get nodeType() {
    return 9;
  }
  get forms() {
    return this.documentElement.getElementsByTagName("form");
  }
  addEventListener(...args) {
    this[emitterSymbol].on(...args);
  }
  removeEventListener(...args) {
    this[emitterSymbol].removeListener(...args);
  }
  createDocumentFragment() {
    return DocumentFragment(elementFactory);
  }
  createElement(elementTagName) {
    const element = elementFactory(this, this.$(`<${elementTagName}></${elementTagName}>`));
    this[loadedSymbol].push(element);
    return element;
  }
  createElementNS(namespaceURI, elementTagName) {
    return this.createElement(elementTagName);
  }
  createTextNode(text) {
    return {
      textContent: text,
    };
  }
  dispatchEvent(event) {
    if (event && event.type === "fullscreenchange") {
      if (!event.target) return;

      if (this[fullscreenElementSymbol] === null) {
        this[fullscreenElementSymbol] = event.target;
      } else if (this[fullscreenElementSymbol] === event.target) {
        this[fullscreenElementSymbol] = null;
      }

      this[emitterSymbol].emit("fullscreenchange", event);
    } else {
      this[emitterSymbol].emit(event.type, event);
    }
  }
  exitFullscreen() {
    const fullscreenchangeEvent = new Event("fullscreenchange");
    fullscreenchangeEvent.target = this[fullscreenElementSymbol];

    this.dispatchEvent(fullscreenchangeEvent);
  }
  getElementById(id) {
    const $idElm = this[dollarSymbol](`#${id}`).eq(0);

    if ($idElm && $idElm.length) return this._getElement($idElm);
    return null;
  }
  getElementsByTagName(name) {
    return this.documentElement.getElementsByTagName(name);
  }
  getElementsByClassName(classNames) {
    return this.documentElement.getElementsByClassName(classNames);
  }
  getElementsByName(name) {
    return new HTMLCollection(this.documentElement, `[name="${name}"],#${name}`, {attributes: true});
  }
  importNode(element, deep) {
    if (element instanceof DocumentFragment) {
      return element._clone(deep);
    }

    return element.cloneNode(deep);
  }
  _getElement($elm) {
    if ($elm === this[dollarSymbol]) return this;
    if (!$elm.length) return;

    let mockElement = this[loadedSymbol].find((mockedElm) => mockedElm.$elm[0] === $elm[0]);
    if (mockElement) {
      return mockElement;
    }

    mockElement = elementFactory(this, $elm);

    this[loadedSymbol].push(mockElement);
    return mockElement;
  }
}

module.exports = Document;

// function Document(source, cookieJar) {
//   const location = source.location || getLocation(source.url);
//   const referrer = source.referrer || "";
//   const $ = cheerio.load(source.text, {decodeEntities: false});
//   const loaded = [];

//   const emitter = new EventEmitter();

//   let fullscreenElement = null;
//   let forms;

//   const document = {
//     _getElement: getElement,
//     _emitter: emitter,
//     addEventListener,
//     // createDocumentFragment() {
//     //   return DocumentFragment(elementFactory);
//     // },
//     // createElement,
//     // createElementNS,
//     // createTextNode,
//     dispatchEvent,
//     exitFullscreen,
//     getElementById,
//     getElementsByTagName(name) {
//       return this.documentElement.getElementsByTagName(name);
//     },
//     getElementsByClassName(classNames) {
//       return this.documentElement.getElementsByClassName(classNames);
//     },
//     getElementsByName,
//     importNode,
//     location,
//     removeEventListener,
//     referrer,
//     textContent: null,
//     $,
//   };

//   Object.defineProperty(document, "head", {
//     get: getHead
//   });

//   Object.defineProperty(document, "body", {
//     get: getBody
//   });

//   Object.defineProperty(document, "documentElement", {
//     get: () => getElement($("html"))
//   });

//   Object.defineProperty(document, "firstElementChild", {
//     get: () => getElement($("html"))
//   });

//   Object.defineProperty(document, "firstChild", {
//     get: () => getElement($("> :first-child"))
//   });

//   Object.defineProperty(document, "fullscreenElement", {
//     get: () => fullscreenElement
//   });

//   Object.defineProperty(document, "cookie", {
//     get() {
//       return cookieJar.getCookies({path: location.pathname, script: true, domain: location.hostname, secure: location.protocol === "https:"}).toValueString();
//     },
//     set: (value) => {
//       cookieJar.setCookie(value);
//     }
//   });

//   Object.defineProperty(document, "title", {
//     get: () => getElement($("head > title")).textContent,
//     set: (value) => {
//       getElement($("head > title")).textContent = value;
//     }
//   });

//   Object.defineProperty(document, "nodeType", {
//     get: () => 9
//   });

//   Object.defineProperty(document, "forms", {
//     get() {
//       if (!forms) forms = document.documentElement.getElementsByTagName("form");
//       return forms;
//     }
//   });

//   return document;

//   function exitFullscreen() {
//     const fullscreenchangeEvent = new Event("fullscreenchange");
//     fullscreenchangeEvent.target = fullscreenElement;

//     document.dispatchEvent(fullscreenchangeEvent);
//   }

//   function getHead() {
//     return getElement($("head"));
//   }

//   function getBody() {
//     return getElement($("body"));
//   }

//   function getElement($elm) {
//     if ($elm === $) return document;
//     if (!$elm.length) return;

//     let mockElement = loaded.find((mockedElm) => mockedElm.$elm[0] === $elm[0]);
//     if (mockElement) {
//       return mockElement;
//     }

//     mockElement = elementFactory(document, $elm);

//     loaded.push(mockElement);
//     return mockElement;
//   }

//   function getElementById(id) {
//     const $idElm = $(`#${id}`).eq(0);

//     if ($idElm && $idElm.length) return getElement($idElm);
//     return null;
//   }

//   function getElementsByName(name) {
//     return new HTMLCollection(document.documentElement, `[name="${name}"],#${name}`, {attributes: true});
//   }

//   function createElement(elementTagName) {
//     const element = elementFactory(document, document.$(`<${elementTagName}></${elementTagName}>`));
//     loaded.push(element);
//     return element;
//   }

//   function createElementNS(namespaceURI, elementTagName) {
//     return createElement(elementTagName);
//   }

//   function createTextNode(text) {
//     return {
//       textContent: text,
//     };
//   }

//   function addEventListener(...args) {
//     emitter.on(...args);
//   }

//   function removeEventListener(...args) {
//     emitter.removeListener(...args);
//   }

//   function dispatchEvent(event) {
//     if (event && event.type === "fullscreenchange") {
//       if (!event.target) return;

//       if (fullscreenElement === null) {
//         fullscreenElement = event.target;
//       } else if (fullscreenElement === event.target) {
//         fullscreenElement = null;
//       }

//       emitter.emit("fullscreenchange", event);
//     } else {
//       emitter.emit(event.type, event);
//     }
//   }

//   if (!event.target) return;

//       if (fullscreenElement === null) {
//         fullscreenElement = event.target;
//       } else if (fullscreenElement === event.target) {
//         fullscreenElement = null;
//       }

//       emitter.emit("fullscreenchange", event);
//     if (!event.target) return;

//     if (fullscreenElement === null) {
//       fullscreenElement = event.target;
//     } else if (fullscreenElement === event.target) {
//       fullscreenElement = null;
//     }

//     emitter.emit("fullscreenchange", event);
//   }

//   function importNode(element, deep) {
//     if (element instanceof DocumentFragment) {
//       return element._clone(deep);
//     }

//     return element.cloneNode(deep);
//   }
// }

// module.exports = Document;
