"use strict";

const {Cookie} = require("cookiejar");

module.exports = function saveToJar(jar, cookieList, cookieDomain) {
  if (!cookieList) return;
  if (!Array.isArray(cookieList)) cookieList = cookieList.split(/,\s?/).filter(Boolean);

  for (const cookieStr of cookieList) {
    const cookie = new Cookie(cookieStr);
    if (!cookie.domain) cookie.domain = cookieDomain;
    jar.setCookie(cookie.toString());
  }
};
