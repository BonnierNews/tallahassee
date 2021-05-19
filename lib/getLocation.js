"use strict";

const Url = require("url");

module.exports = function getLocation(uri) {
  if (!uri) return;

  const parsedUrl = Url.parse(uri);
  const {hash, host, hostname, pathname, port, protocol, search} = parsedUrl;
  let href = parsedUrl.href;

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
    reload: () => {
      href = parsedUrl.href;
    }
  };
};
