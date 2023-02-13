import http from "http";
import https from "https";

import { Event } from "./Events.js";
import EventTarget from "./EventTarget.js";
import Origin from "./Origin.js";

const kData = Symbol.for("response text");
const kReadyState = Symbol.for("ready state");
const kRequest = Symbol.for("request");
const kResponse = Symbol.for("response");
const kWindow = Symbol.for("window");
const kCookieJar = Symbol.for("cookieJar");

const UNSENT = 0; // Client has been created. open() not called yet.
const OPENED = 1; // open() has been called.
const HEADERS_RECEIVED = 2; // send() has been called, and headers and status are available.
const LOADING = 3; // Downloading; responseText holds partial data.
const DONE = 4; // The operation is complete.

class XMLHttpRequest extends EventTarget {
  constructor(window) {
    super();
    this[kWindow] = window;
    this[kReadyState] = UNSENT;
    this.onreadystatechange = null;
    this.withCredentials = false;
  }
  get readyState() {
    return this[kReadyState];
  }
  get responseText() {
    return this[kData];
  }
  get status() {
    return this[kResponse]?.statusCode || 0;
  }
  get statusText() {
    const readyState = this[kReadyState];
    switch (readyState) {
      case UNSENT:
        return `${readyState} UNSENT`;
      case OPENED:
        return `${readyState} OPENED`;
      case HEADERS_RECEIVED:
        return `${readyState} HEADERS_RECEIVED`;
      case LOADING:
        return `${readyState} LOADING`;
      case DONE:
        return `${readyState} DONE`;
      default:
        return "";
    }
  }
  open(method, url) {
    this[kData] = "";
    const options = this._init(url);
    this._makeRequest(method, options);
  }
  setRequestHeader(name, value) {
    this[kRequest].setHeader(name, value);
  }
  send(body) {
    const req = this[kRequest];
    if (body !== undefined) req.write(body);
    req.end();
  }
  getAllResponseHeaders() {
    const rawHeaders = this[kResponse]?.rawHeaders.slice();
    if (!rawHeaders) return;
    const result = [];
    while (rawHeaders.length) {
      const name = rawHeaders.shift().toLowerCase();
      const value = rawHeaders.shift();
      if (name === "set-cookie") continue;
      result.push(`${name}: ${value}`);
    }
    return result.join("\r\n");
  }
  _init(url) {
    const window = this[kWindow];
    const parsedUri = new URL(url, `${window.location.protocol}//${window.location.hostname}`);
    const isLocal = parsedUri.hostname === window.location.hostname;
    const result = { url, headers: {} };

    const referrer = this[kWindow].document.referrer;
    if (referrer) result.headers.referer = referrer;

    const cookie = (isLocal || this.withCredentials) && window.document[kCookieJar].getCookies({
      path: parsedUri.pathname,
      domain: isLocal ? window.location.hostname : parsedUri.hostname,
      secure: (isLocal ? window.location.protocol : parsedUri.protocol) === "https:",
    }).toValueString();

    if (cookie) result.headers.cookie = cookie;

    if (!isLocal) return result;

    const origin = result.origin = new Origin(window._getOrigin());
    const base = origin.initSync();
    const originUrl = new URL(parsedUri.pathname, base);

    result.url = originUrl.toString();
    result.headers = {
      ...window._getRequestHeaders(),
      ...result.headers,
    };

    return result;
  }
  _makeRequest(method, { url, headers, origin }) {
    const uri = new URL(url);
    const req = this[kRequest] = (uri.protocol === "https:" ? https : http).request({
      method,
      host: uri.host,
      port: uri.port,
      path: uri.pathname + uri.search,
    });

    for (const [ name, value ] of Object.entries(headers)) {
      if (value !== undefined) req.setHeader(name, value);
    }

    this[kReadyState] = OPENED;
    this.dispatchEvent(new Event("readystatechange"));

    req.on("response", (response) => {
      if (response.headers["set-cookie"]?.length) {
        const window = this[kWindow];
        for (let c of response.headers["set-cookie"]) {
          if (!/; domain=/i.test(c)) c = `${c}; Domain=${window.location.hostname}`;
          window.document.cookie = c;
        }
      }

      this[kReadyState] = HEADERS_RECEIVED;
      this[kResponse] = response;
      this.dispatchEvent(new Event("readystatechange"));

      response.on("data", (chunk) => {
        const preState = this[kReadyState];
        this[kData] += chunk;
        this[kReadyState] = LOADING;
        if (preState !== LOADING) this.dispatchEvent(new Event("readystatechange"));
        this.dispatchEvent(new Event("progress"));
      }).on("end", () => {
        if (origin) origin.close();

        this[kReadyState] = DONE;
        this.dispatchEvent(new Event("readystatechange"));
        this.dispatchEvent(new Event("load"));
      });
    });
  }
}

XMLHttpRequest.UNSENT = UNSENT;
XMLHttpRequest.OPENED = OPENED;
XMLHttpRequest.HEADERS_RECEIVED = HEADERS_RECEIVED;
XMLHttpRequest.LOADING = LOADING;
XMLHttpRequest.DONE = DONE;

export default XMLHttpRequest;
