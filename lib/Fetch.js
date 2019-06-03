"use strict";

const url = require("url");

const NodeFetch = require("node-fetch");

module.exports = function Fetch(agent, context) {
  const stack = [];
  const defaultRequestHeaders = (context.request && context.request.header) || {};
  const localAppHost = defaultRequestHeaders["x-forwarded-host"] || defaultRequestHeaders.host;

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

  function fetch(uri, options = {}) {
    if (isLocalResource(uri)) return getRelative(uri, options);

    const {hostname, pathname} = url.parse(uri);
    const cookie = agent.jar.getCookies({path: pathname, domain: hostname}).toValueString();
    if (cookie) {
      options.headers = options.headers || {};
      options.headers.cookie = cookie;
    }

    return NodeFetch(uri, {...options, redirect: "manual"}).then((res) => {
      const statusCode = res.status;

      const setCookies = res.headers.get("set-cookie");
      if (setCookies) {
        agent.jar.setCookies(setCookies.split(","), url.parse(res.url).host);
      }

      if (options.redirect !== "manual") {
        if ([301, 302, 303].includes(statusCode)) {
          return fetch(res.headers.get("location"));
        }

        if ([307, 308].includes(statusCode)) {
          return fetch(res.headers.get("location"), options);
        }
      }

      return res;
    });
  }

  function isLocalResource(uri) {
    if (uri.startsWith("/")) return true;
    return url.parse(uri).host === localAppHost;
  }

  function getRelative(uri, options = {}) {
    let req;

    uri = url.parse(uri).path;

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

    const cookie = agent.jar.getCookies({path: uri, domain: defaultRequestHeaders.host}).toValueString();
    if (cookie) {
      req.set("cookie", cookie);
    }

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
