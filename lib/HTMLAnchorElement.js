"use strict";

const { PointerEvent } = require("./Events.js");
const HTMLElement = require("./HTMLElement.js");

const urlSymbol = Symbol.for("href");

module.exports = class HTMLAnchorElement extends HTMLElement {
  get href() {
    return hrefPropertyGetter(this[urlSymbol], "href");
  }
  set href(value) {
    return this.setAttribute("href", value);
  }
  get hash() {
    return hrefPropertyGetter(this[urlSymbol], "hash");
  }
  get protocol() {
    return hrefPropertyGetter(this[urlSymbol], "protocol");
  }
  get hostname() {
    return hrefPropertyGetter(this[urlSymbol], "hostname");
  }
  get host() {
    return hrefPropertyGetter(this[urlSymbol], "host");
  }
  get port() {
    return hrefPropertyGetter(this[urlSymbol], "port");
  }
  get origin() {
    return "null";
  }
  get pathname() {
    return hrefPropertyGetter(this[urlSymbol], "pathname");
  }
  get search() {
    return hrefPropertyGetter(this[urlSymbol], "search");
  }
  get [urlSymbol]() {
    let href = this.getAttribute("href");
    const location = this.ownerDocument.location;
    if (!href) return this.hasAttribute("href") ? new URL(location.origin) : undefined;
    if (href.startsWith("//")) href = location.protocol + href;
    return new URL(href, location.origin);
  }
  toString() {
    return this.href;
  }
  async click() {
    const clickEvent = new PointerEvent("click", { bubbles: true, cancelable: true });
    this.dispatchEvent(clickEvent);

    if (clickEvent.defaultPrevented) {
      await Promise.all(this.ownerDocument.defaultView.fetch._pendingRequests);
      return this.ownerDocument._browser;
    }

    let uri, headers;
    if (this.host === this.ownerDocument.location.host) {
      uri = `${this.pathname}${this.search}`;
      headers = { Referer: this.ownerDocument._browser.window.location.href };
    } else {
      uri = this.href;
    }
    return this.ownerDocument._browser.navigateTo(uri, headers);
  }
};

function hrefPropertyGetter(url, propertyName) {
  if (!url) return url === null ? "" : undefined;
  const value = url[propertyName] || "";
  switch (url.protocol) {
    case "mailto:": {
      return decodeURIComponent(value);
    }
    case "tel:": {
      return decodeURIComponent(value);
    }
  }
  return value;
}
