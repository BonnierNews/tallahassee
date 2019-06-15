"use strict";

module.exports = function Fetch(browserFetch) {
  const stack = [];

  function fetch(...args) {
    const request = browserFetch(...args);

    const stackedProm = request.then(() => {
      stack.pop();
    }).catch(() => {
      stack.pop();
    });
    stack.push(stackedProm);

    return request;
  }

  fetch._pendingRequests = stack;

  return fetch;
};
