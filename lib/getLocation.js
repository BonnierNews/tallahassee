"use strict";

const Url = require("url");

module.exports = function getLocation(request) {
  if (!request) return {};

  const {header, url} = request;
  const {host, Host} = header;

  let location = Url.parse(url);
  if (host || Host) {
    location.host = host || Host;
    location = Url.parse(Url.format(location));
  }

  return location;
};
