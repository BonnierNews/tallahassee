"use strict";

const {Cookie} = require("cookiejar");

module.exports = function saveToJar(jar, cookieList, cookieDomain) {
  if (!cookieList) return;
  if (!Array.isArray(cookieList)) cookieList = cookieList.split(",").filter(Boolean);

  for (const cookieStr of cookieList) {
    const cookie = Cookie(cookieStr);
    if (!cookie.domain) cookie.domain = cookieDomain;
    jar.setCookie(cookie);
  }
};