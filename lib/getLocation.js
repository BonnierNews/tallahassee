"use strict";

const getHeaders = require("./getHeaders");
const Url = require("url");

module.exports = function getLocation(request) {
  if (!request) return {};

  const {host: hostHeader, proto: protoHeader} = getHeaders(request);

  let location = makeLocationFromUri(request.uri) || makeLocationFromUrl(request.url);
  if (hostHeader) {
    location.port = undefined;
    location.host = hostHeader;
    location.hostname = undefined;
    location = makeLocationFromUrl(Url.format(location));
  }
  if (protoHeader) {
    location.protocol = `${protoHeader}:`;
    location = makeLocationFromUrl(Url.format(location));
  }

  return location;

  function makeLocationFromUrl(browserUrl) {
    return makeLocationFromUri(Url.parse(browserUrl));
  }

  function makeLocationFromUri(uri) {
    if (!uri) return;
    const {hash, host, hostname, href, pathname, port, protocol, search} = uri;

    return {
      hash,
      host,
      hostname,
      href,
      pathname,
      port,
      protocol,
      search,
      origin: `${protocol}//${host}`,
    };
  }
};
