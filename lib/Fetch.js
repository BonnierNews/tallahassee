"use strict";

module.exports = class Fetch {
  constructor(browserFetch) {
    const stack = new Map();

    function fetch(...args) {
      const key = args;
      const request = browserFetch(...args);

      const stackedProm = request
        .then(() => {
          stack.delete(key);
          return [ null ].concat(args);
        })
        .catch((error) => {
          stack.delete(key);
          return [ error ].concat(args);
        });

      stack.set(key, stackedProm);

      return request;
    }

    Object.defineProperty(fetch, "_pendingRequests", {
      get() {
        return Array.from(stack.values());
      },
    });

    return fetch;
  }
};
