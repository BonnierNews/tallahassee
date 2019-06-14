"use strict";

module.exports = function Fetch(browserFetch) {
  const stack = [];

  function fetch(...args) {
    const request = browserFetch(...args);
    stack.push(request);
    return request;
  }

  fetch._pendingRequests = stack;

  return fetch;
};
