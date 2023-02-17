"use strict";

const http = require("http");

module.exports = class Origin {
  constructor(origin) {
    this.origin = origin;
    this.type = typeof origin;
  }
  async init() {
    switch (this.type) {
      case "function": {
        const server = this.server = await this._startHttpServer(this.origin);
        return `http://127.0.0.1:${server.address().port}`;
      }
      case "number":
        return `http://127.0.0.1:${this.origin}`;
      case "string":
        return this.origin;
      default:
        return `http://127.0.0.1:${process.env.PORT || ""}`;
    }
  }
  initSync() {
    switch (this.type) {
      case "function": {
        const server = this.server = http.createServer(this.origin);
        server.listen();
        return `http://127.0.0.1:${server.address().port}`;
      }
      case "number":
        return `http://127.0.0.1:${this.origin}`;
      case "string":
        return this.origin;
      default:
        return `http://127.0.0.1:${process.env.PORT}`;
    }
  }
  close() {
    this.server = this.server?.close();
  }
  _startHttpServer(requestListener) {
    const server = http.createServer(requestListener);
    return new Promise((resolve) => {
      server.listen(0, () => resolve(server));
    });
  }
};
