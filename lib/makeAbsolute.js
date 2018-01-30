"use strict";

const url = require("url");

module.exports = function makeAbsolute(location, val) {
  if (!val) return val;
  if (/^\/\/\w/.test(val)) return location.protocol + val;
  if (!val.startsWith("/")) return val;

  return url.format(Object.assign({}, location, {pathname: val, path: val}));
};
