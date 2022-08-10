"use strict";

const assert = require("assert");
const NodeFetch = require("node-fetch");
const url = require("url");
const BrowserTab = require("./lib/BrowserTab");
const Origin = require("./lib/Origin");
const {version} = require("./package.json");
const {CookieAccessInfo, CookieJar, Cookie} = require("cookiejar");
const {normalizeHeaders, getLocationHost} = require("./lib/getHeaders");

module.exports = Tallahassee;

const kOrigin = Symbol.for("origin");
const kRequestHeaders = Symbol.for("request headers");

class WebPage {
  constructor(browser, originRequestHeaders) {
    this.browser = browser;
    this[kOrigin] = browser[kOrigin];
    this.jar = browser.jar;
    this.originRequestHeaders = originRequestHeaders;
    this.originHost = getLocationHost(originRequestHeaders);
    this.userAgent = `Tallahassee/${version}`;
    this.protocol = `${originRequestHeaders["x-forwarded-proto"] || "http"}:`;
    this.referrer = originRequestHeaders.referer;
  }
  async navigateTo(uri, headers, statusCode = 200) {
    const requestHeaders = normalizeHeaders(headers);
    if (requestHeaders["user-agent"]) this.userAgent = requestHeaders["user-agent"];

    if (requestHeaders.cookie) {
      const publicHost = getLocationHost(requestHeaders);
      const parsedUri = url.parse(uri);
      const cookieDomain = parsedUri.hostname || publicHost || this.originHost || "127.0.0.1";
      const isSecure = (parsedUri.protocol || this.protocol) === "https:";

      this.jar.setCookies(requestHeaders.cookie.split(";").map((c) => c.trim()).filter(Boolean), cookieDomain, "/", isSecure);
    }

    const resp = await this.fetch(uri, {
      method: "GET",
      headers: requestHeaders,
    });
    assert.equal(resp.status, statusCode, `Unexepected status code. Expected: ${statusCode}. Actual: ${resp.statusCode}`);
    assert(resp.headers.get("content-type").match(/text\/html/i), `Unexepected content type. Expected: text/html. Actual: ${resp.headers["content-type"]}`);
    const browser = new BrowserTab(this, resp);
    return browser.load();
  }
  load(resp) {
    const requestHeaders = this.originRequestHeaders;
    if (requestHeaders["user-agent"]) this.userAgent = requestHeaders["user-agent"];

    const publicHost = getLocationHost(requestHeaders);
    const cookieDomain = publicHost || this.originHost || "127.0.0.1";

    if (requestHeaders.cookie) {
      const isSecure = this.protocol === "https:";
      this.jar.setCookies(requestHeaders.cookie.split(";").map((c) => c.trim()).filter(Boolean), cookieDomain, "/", isSecure);
    }

    const browser = new BrowserTab(this, resp);
    return browser.load();
  }
  async submit(uri, options) {
    const res = await this.fetch(uri, options);
    const response = await this.handleResponse(res, options);
    const browser = new BrowserTab(this, response);
    return browser.load();
  }
  async fetch(uri, requestOptions = {}) {
    this.numRedirects = 0;
    const res = await this.makeRequest(uri, requestOptions);
    return this.handleResponse(res, requestOptions);
  }
  async handleResponse(res, requestOptions) {
    const resUrl = this._getResponseURL(res);
    const setCookieHeader = res.headers.raw()["set-cookie"];
    const flOrigin = res.headers.get("fl-origin");

    if (setCookieHeader) {
      for (const cookieStr of setCookieHeader) {
        const cookie = new Cookie(cookieStr);
        if (!cookie.explicit_path) cookie.path = resUrl.pathname;
        if (!cookie.domain) cookie.domain = resUrl.hostname;
        this.jar.setCookie(cookie.toString());
      }
    }

    if (res.status > 300 && res.status < 309 && requestOptions.redirect !== "manual") {
      this.numRedirects++;
      if (this.numRedirects > 20) {
        throw new Error("Too many redirects");
      }
      let location = res.headers.get("location");
      if (flOrigin) {
        location = location.replace(flOrigin, "");
      }
      const redirectOptions = {...requestOptions};

      if (res.status === 307 || res.status === 308) {
        // NO-OP
      } else {
        redirectOptions.method = "GET";
        delete redirectOptions.body;
      }

      const redirectedRes = await this.makeRequest(location, redirectOptions);
      return this.handleResponse(redirectedRes, requestOptions);
    }

    if (!flOrigin) return res;

    res.headers.delete("fl-origin");

    const originHost = this.originHost;

    if (!originHost) return res;

    const originUrl = resUrl.toString();
    return new Proxy(res, {
      get(target, prop) {
        if (prop === "url") return originUrl;
        return target[prop];
      }
    });
  }
  async makeRequest(uri, requestOptions = {method: "GET", headers: {}}) {
    let origin, flOrigin;
    const parsedUri = url.parse(uri);
    let headers = requestOptions.headers = normalizeHeaders(requestOptions.headers);
    const isLocal = uri.startsWith("/") || parsedUri.hostname === this.originHost;
    if (isLocal) {
      origin = new Origin(this[kOrigin]);
      flOrigin = await origin.init();
      uri = new URL(parsedUri.path, flOrigin).toString();
      headers = requestOptions.headers = {
        ...this.originRequestHeaders,
        ...headers,
      };
    } else {
      headers.host = parsedUri.host;
    }

    const publicHost = getLocationHost(headers);
    const cookieDomain = parsedUri.hostname || publicHost || this.originHost || "127.0.0.1";
    const isSecure = (parsedUri.protocol || this.protocol) === "https:";
    const accessInfo = CookieAccessInfo(cookieDomain, parsedUri.pathname, isSecure);

    const cookieValue = this.jar.getCookies(accessInfo).toValueString();
    if (cookieValue) headers.cookie = cookieValue;

    try {
      const response = await NodeFetch(uri, {...requestOptions, redirect: "manual"});
      if (isLocal) {
        response.headers.set("fl-origin", flOrigin);
      }
      response[kRequestHeaders] = headers;
      response[kOrigin] = this[kOrigin];
      return response;
    } finally {
      if (origin) origin.close();
    }
  }
  _getResponseURL(res) {
    const resUrl = new URL(res.url);
    const flOrigin = res.headers.get("fl-origin");
    if (!this.originHost || !flOrigin) return resUrl;

    resUrl.port = "";
    resUrl.host = this.originHost;
    resUrl.protocol = this.protocol;

    return resUrl;
  }
}

function Tallahassee(...args) {
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

Tallahassee.prototype.navigateTo = async function navigateTo(linkUrl, headers = {}, statusCode = 200) {
  const webPage = this._getWebPage(headers);
  return webPage.navigateTo(linkUrl, webPage.originRequestHeaders, statusCode);
};

Tallahassee.prototype.load = function load(markup) {
  const webPage = this._getWebPage();
  const resp = {
    text: () => markup,
    url: `${webPage.protocol}//${webPage.originHost || "127.0.0.1"}`
  };
  return webPage.load(resp);
};

Tallahassee.prototype._getWebPage = function getWebPage(headers) {
  const requestHeaders = {
    ...normalizeHeaders(this.options.headers),
    ...normalizeHeaders(headers),
  };

  const setCookieHeader = requestHeaders["set-cookie"];
  if (setCookieHeader) {
    for (const cookieStr of Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]) {
      const cookie = new Cookie(cookieStr);
      this.jar.setCookie(cookie.toString());
    }
    requestHeaders["set-cookie"] = undefined;
  }

  return new WebPage(this, requestHeaders);
};
