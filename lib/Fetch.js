"use strict";

const getHeaders = require("./getHeaders");
const supertest = require("supertest");
const NodeFetch = require("node-fetch");

module.exports = function Fetch(app, resp) {
  const stack = [];

  const defaultRequestHeaders = (resp.request && resp.request.header) || {};
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
    let req = supertest(app);

    if (options.method === "POST") {
      req = req.post(uri).send(options.body);
    } else {
      req = req.get(uri);
    }

    if (cookie) {
      req.set("cookie", cookie);
    }
    const reqHeaders = defaultRequestHeaders;
    if (options.headers) {
      Object.assign(reqHeaders, options.headers);
    }
    Object.keys(reqHeaders).forEach((header) => {
      req.set(header, reqHeaders[header]);
    });

    return req.then((res) => {
      return {
        ok: res.statusCode >= 200 && res.statusCode < 300,
        status: res.statusCode,
        text() {
          return Promise.resolve(res.text);
        },
        json() {
          return Promise.resolve(res.body);
        },
      };
    });
  }
};
