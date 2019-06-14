"use strict";

module.exports = {
  getHeaders,
  normalizeHeaders,
  getLocationHost,
};

function getHeaders(request) {
  if (!request || !request.header) return {};

  const headers = normalizeHeaders(request.header);
  if (headers.cookie) headers.cookie = cleanCookie(headers.cookie);
  return headers;
}

function normalizeHeaders(headers) {
  const result = {};
  if (!headers) return result;
  for (const key in headers) {
    result[key.toLowerCase()] = headers[key];
  }
  return result;
}

function cleanCookie(cookie) {
  if (!cookie) return "";
  if (!/;$/.test(cookie)) return `${cookie};`;
  return cookie;
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
