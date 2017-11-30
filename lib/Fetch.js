"use strict";

const supertest = require("supertest");
const NodeFetch = require("node-fetch");

module.exports = function Fetch(app, resp) {
  const stack = [];
  const {cookie, Cookie} = resp.request.header || {};

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
    if (uri.startsWith("/")) return getRelative(uri);
    return NodeFetch(uri, ...args);
  }

  function getRelative(uri) {
    return supertest(app)
      .get(uri)
      .set("cookie", cookie || Cookie)
      .then((res) => {
        return {
          status: res.statusCode,
          json: () => res.body,
          text: () => res.text
        };
      });
  }
};
