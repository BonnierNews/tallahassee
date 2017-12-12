"use strict";

module.exports = function getHeaders(resp) {
  if (!resp || !resp.request || !resp.request.header) return {};

  const reqHeader = resp.request.header;

  const headers = {};
  for (const name in reqHeader) {
    headers[name.toLowerCase()] = reqHeader[name];
  }

  return headers;
};
