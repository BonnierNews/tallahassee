"use strict";

const url = require("url");

module.exports = {
  normalizeHeaders,
  getLocationHost,
  getCookieDomain
};

function normalizeHeaders(headers) {
  const result = {};
  if (!headers) return result;

  for (const key in headers) {
    result[key.toLowerCase()] = headers[key];
  }
  return result;
}

function getLocationHost(headers) {
  let host;
  if (!headers) return host;

  for (const key in headers) {
    if (key.toLowerCase() === "host") host = headers[key];
    if (key.toLowerCase() === "x-forwarded-host") return headers[key];
  }

  return host;
}

function getCookieDomain(cookie, browserTab, requestHeaders, uri = "") {
  const publicHost = getLocationHost(requestHeaders);
  const parsedUri = url.parse(uri);
  const cookieDomain = parsedUri.hostname || publicHost || browserTab.originHost || "127.0.0.1";

  const protocol = cookie.isSecure ? "https" : "http";
  return `${protocol}://${cookie.domain || cookieDomain}`;
}
