"use strict";

const Element = require("./Element");

module.exports = class HTMLAnchorElement extends Element {
  get href() {
    let href = this.getAttribute("href");
    if (href !== "" && !href) return;
    const location = this.ownerDocument.location;
    if (href.startsWith("//")) href = location.protocol + href;
    return new URL(href, location.origin).href;
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
  if (!href) return undefined;
  return new URL(href)[propertyName] || "";
}
