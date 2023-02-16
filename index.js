"use strict";

const { CookieJar, Cookie } = require("cookiejar");

const { normalizeHeaders } = require("./lib/getHeaders.js");
const WebPage = require("./lib/WebPage.js");

const kOrigin = Symbol.for("origin");

module.exports = class Tallahassee {
  constructor(...args) {
    let origin, options;
    if (typeof args[0] === "object") {
      options = args[0];
    } else {
      origin = args[0];
      options = args[1] || {};
    }
    if (!(this instanceof Tallahassee)) return new Tallahassee(origin, options);
    this[kOrigin] = origin;
    this.jar = new CookieJar();
    this.options = options;
  }

  navigateTo(uri, headers = {}, statusCode = 200) {
    const webPage = this._getWebPage(headers);
    return webPage.navigateTo(uri, webPage.isOriginUrl(uri) && webPage.originRequestHeaders, statusCode);
  }

  load(markup) {
    const webPage = this._getWebPage();
    const resp = {
      text: () => markup,
      url: `${webPage.protocol}//${webPage.originHost || "127.0.0.1"}`,
    };
    return webPage.load(resp);
  }

  _getWebPage(headers) {
    const requestHeaders = {
      ...normalizeHeaders(this.options.headers),
      ...normalizeHeaders(headers),
    };

    const setCookieHeader = requestHeaders["set-cookie"];
    if (setCookieHeader) {
      for (const cookieStr of Array.isArray(setCookieHeader) ? setCookieHeader : [ setCookieHeader ]) {
        const cookie = new Cookie(cookieStr);
        this.jar.setCookie(cookie.toString());
      }
      delete requestHeaders["set-cookie"];
    }

    return new WebPage(this[kOrigin], this.jar, requestHeaders, this.options);
  }
};
