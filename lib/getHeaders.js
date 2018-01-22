"use strict";

module.exports = function getHeaders(request) {
  if (!request || !request.header) return {};

  const reqHeader = request.header;

  const headers = {};
  for (const name in reqHeader) {
    const lowerName = name.toLowerCase();
    let val = reqHeader[name];
    if (lowerName === "cookie") val = cleanCookie(val);
    headers[lowerName] = val;
  }

  return headers;
};

function cleanCookie(cookie) {
  if (!cookie) return "";
  if (!/;$/.test(cookie)) return `${cookie};`;
  return cookie;
}
