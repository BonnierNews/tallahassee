"use strict";

const assert = require("assert");
const NodeFetch = require("node-fetch");
const supertest = require("supertest");
const url = require("url");
const BrowserTab = require("./lib/BrowserTab");
const {version} = require("./package.json");
const {CookieAccessInfo} = require("cookiejar");
const {normalizeHeaders, getLocationHost} = require("./lib/getHeaders");
const saveToJar = require("./lib/saveToJar");

module.exports = Tallahassee;

const responseSymbol = Symbol.for("response");

class OriginResponse {
  constructor(uri, response, originHost, protocol) {
    this[responseSymbol] = response;
    const status = this.status = response.statusCode;
    this.ok = status >= 200 && status < 300;
    this.headers = new Map(Object.entries(response.headers));
    this.url = originHost ? `${protocol}//${originHost}${uri}` : response.request.url;
  }
  text() {
    return Promise.resolve(this[responseSymbol].text);
  }
  json() {
    return Promise.resolve(this[responseSymbol].body);
  }
}

class WebPage {
  constructor(agent, originRequestHeaders) {
    this.agent = agent;
    this.jar = agent.jar;
    this.originRequestHeaders = originRequestHeaders;
    this.originHost = getLocationHost(originRequestHeaders);
    this.userAgent = `Tallahassee/${version}`;
    this.protocol = `${originRequestHeaders["x-forwarded-proto"] || "http"}:`;
    this.referrer = originRequestHeaders.referer;
  }
  async load(uri, headers, statusCode = 200) {
    const requestHeaders = normalizeHeaders(headers);
    if (requestHeaders["user-agent"]) this.userAgent = requestHeaders["user-agent"];

    if (requestHeaders.cookie) {
      const publicHost = getLocationHost(requestHeaders);
      const parsedUri = url.parse(uri);
      const cookieDomain = parsedUri.hostname || publicHost || this.originHost || "127.0.0.1";
      const isSecure = (parsedUri.protocol || this.protocol) === "https:";

      this.agent.jar.setCookies(requestHeaders.cookie.split(";").map((c) => c.trim()).filter(Boolean), cookieDomain, "/", isSecure);
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
    const setCookieHeader = res.headers.get("set-cookie");
    if (setCookieHeader) {
      const cookieDomain = new URL(res.url).hostname;
      saveToJar(this.jar, setCookieHeader, cookieDomain);
    }

    if (res.status > 300 && res.status < 309 && requestOptions.redirect !== "manual") {
      this.numRedirects++;
      if (this.numRedirects > 20) {
        throw new Error("Too many redirects");
      }
      const location = res.headers.get("location");
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

    return res;
  }
  makeRequest(uri, requestOptions = {method: "GET", headers: {}}) {
    const parsedUri = url.parse(uri);
    let headers = requestOptions.headers = normalizeHeaders(requestOptions.headers);
    const isLocal = uri.startsWith("/") || parsedUri.hostname === this.originHost;
    if (isLocal) {
      headers = requestOptions.headers = {...this.originRequestHeaders, ...headers};
    } else {
      headers.host = parsedUri.host;
    }

    const publicHost = getLocationHost(headers);
    const cookieDomain = parsedUri.hostname || publicHost || this.originHost || "127.0.0.1";
    const isSecure = (parsedUri.protocol || this.protocol) === "https:";
    const accessInfo = CookieAccessInfo(cookieDomain, parsedUri.pathname, isSecure);

    const cookieValue = this.jar.getCookies(accessInfo).toValueString();
    if (cookieValue) headers.cookie = cookieValue;

    return isLocal ? this.originRequest(parsedUri.path, requestOptions) : NodeFetch(uri, {...requestOptions, redirect: "manual"});
  }
  async originRequest(uri, requestOptions) {
    const req = this.buildRequest(uri, requestOptions);
    if (requestOptions.headers) {
      for (const header in requestOptions.headers) {
        const headerValue = requestOptions.headers[header];
        if (headerValue) req.set(header, requestOptions.headers[header]);
      }
    }

    const res = await req;
    return new OriginResponse(uri, res, this.originHost, this.protocol);
  }
  buildRequest(uri, requestOptions) {
    switch (requestOptions.method) {
      case "POST":
        return this.agent.post(uri).send(requestOptions.body);
      case "DELETE":
        return this.agent.delete(uri).send(requestOptions.body);
      case "PUT":
        return this.agent.put(uri).send(requestOptions.body);
      case "HEAD":
        return this.agent.head(uri);
      default:
        return this.agent.get(uri);
    }
  }
}

function Tallahassee(app, options = {}) {
  if (!(this instanceof Tallahassee)) return new Tallahassee(app, options);
  const agent = this.agent = supertest.agent(app);
  this.jar = agent.jar;
  this.options = options;
}

Tallahassee.prototype.navigateTo = async function navigateTo(linkUrl, headers = {}, statusCode = 200) {
  const requestHeaders = {
    ...normalizeHeaders(this.options.headers),
    ...normalizeHeaders(headers),
  };

  if (requestHeaders["set-cookie"]) {
    const setCookies = requestHeaders["set-cookie"];
    saveToJar(this.jar, setCookies);
    requestHeaders["set-cookie"] = undefined;
  }

  const webPage = new WebPage(this.agent, requestHeaders);
  return webPage.load(linkUrl, requestHeaders, statusCode);
};
