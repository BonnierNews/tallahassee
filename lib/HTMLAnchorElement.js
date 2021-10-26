"use strict";

const Element = require("./Element");
const makeAbsolute = require("./makeAbsolute");

module.exports = class HTMLAnchorElement extends Element {
  get href() {
    const rel = this.getAttribute("href");
    return makeAbsolute(this.ownerDocument.location, rel);
  }
  set href(value) {
    return this.setAttribute("href", value);
  }
  get hash() {
    return hrefPropertyGetter(this.href, "hash");
  }
  get protocol() {
    return hrefPropertyGetter(this.href, "protocol");
  }
  get hostname() {
    return hrefPropertyGetter(this.href, "hostname");
  }
  get host() {
    return hrefPropertyGetter(this.href, "host");
  }
  get port() {
    return hrefPropertyGetter(this.href, "port");
  }
  get pathname() {
    const href = this.href;
    const value = hrefPropertyGetter(href, "pathname");
    if (value === "/" && href !== new URL(href).href) return "";
    return value;
  }
  get search() {
    return hrefPropertyGetter(this.href, "search");
  }
  toString() {
    return this.href;
  }
};

function hrefPropertyGetter(href, propertyName) {
  if (!href) return null;
  return new URL(href)[propertyName] || "";
}
