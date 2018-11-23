"use strict";

const getHeaders = require("./getHeaders");
const Url = require("url");

module.exports = function getLocation(request) {
  if (!request) return {};

  const {host, proto} = getHeaders(request);

  let location = request.uri || Url.parse(request.url);
  if (host) {
    location.port = undefined;
    location.host = undefined;
    location.hostname = host;
    location = Url.parse(Url.format(location));
  }
  if (proto) {
    location.protocol = `${proto}:`;
    location = Url.parse(Url.format(location));
  }

  return location;
};
