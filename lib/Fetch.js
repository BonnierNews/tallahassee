"use strict";

const NodeFetch = require("node-fetch");

module.exports = function Fetch(agent, resp) {
  const stack = [];

  const defaultRequestHeaders = (resp.request && resp.request.header) || {};

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
    let req;

    if (options.method === "POST") {
      req = agent.post(uri).send(options.body);
    } else if (options.method === "HEAD") {
      req = agent.head(uri);
    } else {
      req = agent.get(uri);
    }

    const reqHeaders = defaultRequestHeaders;
    if (options.headers) {
      Object.assign(reqHeaders, options.headers);
    }
    Object.keys(reqHeaders).forEach((header) => {
      req.set(header, reqHeaders[header]);
    });

    return req.then((res) => {
      const statusCode = res.statusCode;

      if (options.redirect !== "manual") {
        if ([301, 302, 303].includes(statusCode)) {
          return fetch(res.headers.location);
        }

        if ([307, 308].includes(statusCode)) {
          return fetch(res.headers.location, options);
        }
      }

      return {
        ok: statusCode >= 200 && statusCode < 300,
        status: statusCode,
        headers: new Map(Object.entries(res.headers)),
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
