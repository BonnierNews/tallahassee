"use strict";

const getHeaders = require("./getHeaders");
const supertest = require("supertest");
const NodeFetch = require("node-fetch");

module.exports = function Fetch(app, resp) {
  const stack = [];

  const {cookie} = getHeaders(resp.request);

  fetching._pendingRequests = stack;
  return fetching;

  function fetching(uri, ...args) {
    const prom = fetch(uri, ...args);

    const stackedProm = prom.then(() => {
      stack.pop();
    }).catch(() => {
      stack.pop();
    });
    stack.push(stackedProm);

    return prom;
  }

  function fetch(uri, ...args) {
    if (uri.startsWith("/")) return getRelative(uri, ...args);
    return NodeFetch(uri, ...args);
  }

  function getRelative(uri, options = {}) {
    const req = supertest(app).get(uri);
    if (cookie) {
      req.set("cookie", cookie);
    }
    if (options.headers) {
      Object.keys(options.headers).forEach((header) => {
        req.set(header, options.headers[header]);
      });
    }

    return req.then((res) => {
      return {
        status: res.statusCode,
        json: () => res.body,
        text: () => res.text
      };
    });
  }
};
