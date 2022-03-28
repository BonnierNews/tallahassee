"use strict";

const app = require("../app/app");
const Browser = require("../");
const http = require("http");
const nock = require("nock");
const XMLHttpRequestClass = require("../lib/XMLHttpRequest");

describe("XMLHttpRequest", () => {
  let server, port, browser, tab;
  before(async () => {
    server = http.createServer(app);
    server.listen();
    port = server.address().port;
    tab = new Browser(port);
    browser = await tab.navigateTo("/");
  });
  after(() => {
    server.close();
  });
  beforeEach(nock.cleanAll);

  it("is instance of XMLHttpRequest", async () => {
    const XMLHttpRequest = browser.window.XMLHttpRequest;
    const xhr = new XMLHttpRequest();
    expect(xhr).to.be.instanceof(XMLHttpRequestClass);
  });

  describe("make request", () => {
    it("external resource is supported", async () => {
      nock("http://example.com")
        .get("/")
        .query(true)
        .reply(200, {data: 1});

      const XMLHttpRequest = browser.window.XMLHttpRequest;
      const xhr = new XMLHttpRequest();
      const response = new Promise((resolve, reject) => {
        xhr.onreadystatechange = () => {
          try {
            if (xhr.readyState < XMLHttpRequest.DONE) return;
            resolve(JSON.parse(xhr.responseText));
          } catch (err) {
            reject(err);
          }
        };
      });
      xhr.open("GET", "http://example.com/?qs=1", true);
      xhr.setRequestHeader("Content-type", "application/json");
      xhr.send();

      const body = await response;
      expect(body).to.deep.equal({data: 1});
    });

    it("external post is supported", async () => {
      const json = JSON.stringify({ foo: "bar" });
      nock("http://example.com")
        .post("/", json)
        .reply(200, {data: 1});

      const xhr = new browser.window.XMLHttpRequest();
      const load = new Promise((resolve) => {
        xhr.addEventListener("load", () => {
          resolve(JSON.parse(xhr.responseText));
        });
      });
      xhr.open("POST", "http://example.com/");
      xhr.send(json);

      const body = await load;
      expect(body).to.deep.equal({data: 1});
    });

    it("local post to Express app is supported", async () => {
      const json = JSON.stringify({ foo: "bar" });

      const xhr = new browser.window.XMLHttpRequest();
      const load = new Promise((resolve) => {
        xhr.onload = function onload() {
          resolve(JSON.parse(this.responseText));
        };
      });
      xhr.open("POST", "/post");
      xhr.send(json);

      const body = await load;
      expect(body).to.deep.equal({data: 1});
    });

    it("external delete is supported", async () => {
      const json = JSON.stringify({ foo: "bar" });
      nock("http://example.com")
        .delete("/", json)
        .reply(200, {data: 1});

      const xhr = new browser.window.XMLHttpRequest();
      const load = new Promise((resolve) => {
        xhr.onload = function onload() {
          resolve(JSON.parse(this.responseText));
        };
      });
      xhr.open("DELETE", "http://example.com/");
      xhr.send(json);

      const body = await load;
      expect(body).to.deep.equal({data: 1});
    });

    it("local delete is supported", async () => {
      const json = JSON.stringify({ foo: "bar" });

      const xhr = new browser.window.XMLHttpRequest();
      const load = new Promise((resolve) => {
        xhr.onload = function onload() {
          resolve(JSON.parse(this.responseText));
        };
      });
      xhr.open("DELETE", "/delete");
      xhr.send(json);

      const body = await load;
      expect(body).to.deep.equal({data: 1});
    });

    it("local head is supported", async () => {
      const xhr = new browser.window.XMLHttpRequest();
      const load = new Promise((resolve) => {
        xhr.onload = function onload() {
          resolve(this.status);
        };
      });
      xhr.open("HEAD", "/head");
      xhr.send();

      const status = await load;
      expect(status).to.deep.equal(418);
    });

    it("local resource routes to app", async () => {
      const xhr = new browser.window.XMLHttpRequest();
      const load = new Promise((resolve) => {
        xhr.onload = function onload() {
          resolve(JSON.parse(this.responseText));
        };
      });
      xhr.open("GET", "/api");
      xhr.send();

      const body = await load;
      expect(body).to.deep.equal({data: 1});
    });

    it("local resource routes to app if host match", async () => {
      const page = await tab.navigateTo("/", {
        host: "www.expressen.se",
        "x-forwarded-proto": "https",
      });

      const xhr = new page.window.XMLHttpRequest();
      const load = new Promise((resolve) => {
        xhr.onload = function onload() {
          resolve(JSON.parse(this.responseText));
        };
      });
      xhr.open("GET", "https://www.expressen.se/api");
      xhr.send();

      const body = await load;

      expect(body).to.deep.equal({data: 1});
    });

    it("local resource routes to app if x-forwarded-host match", async () => {
      const page = await tab.navigateTo("/", {
        host: "some-other-host.com",
        "x-forwarded-host": "www.expressen.se",
        "x-forwarded-proto": "https",
      });

      const xhr = new page.window.XMLHttpRequest();
      const load = new Promise((resolve) => {
        xhr.onload = function onload() {
          resolve(JSON.parse(this.responseText));
        };
      });
      xhr.open("GET", "https://www.expressen.se/api");
      xhr.send();

      const body = await load;

      expect(body).to.deep.equal({data: 1});
    });
  });

  describe("make request", () => {
    it("external resource is supported", async () => {
    });
  });

  describe("cookie", () => {
    it("passes cookie to local resource", async () => {
      const page = await tab.navigateTo("/", {
        cookie: "_ga=1"
      });

      const xhr = new page.window.XMLHttpRequest();
      const load = new Promise((resolve) => {
        xhr.onload = function onload() {
          resolve(JSON.parse(this.responseText));
        };
      });
      xhr.open("GET", "/req");
      xhr.send();

      const body = await load;

      expect(body).to.have.property("cookie", "_ga=1");
    });

    it("passes the request headers to local resource", async () => {
      const page = await tab.navigateTo("/", {
        "X-Forwarded-Proto": "https",
        "X-Forwarded-Host": "www.expressen.se"
      });

      const xhr = new page.window.XMLHttpRequest();
      const load = new Promise((resolve) => {
        xhr.onload = function onload() {
          resolve(JSON.parse(this.responseText));
        };
      });
      xhr.open("GET", "/req");
      xhr.send();

      const body = await load;

      expect(body).to.have.property("headers");
      expect(body.headers).to.have.property("x-forwarded-host", "www.expressen.se");
      expect(body.headers).to.have.property("x-forwarded-proto", "https");
    });

    it("sends headers when calling local resource", async () => {
      const page = await tab.navigateTo("/", {
        "X-Forwarded-Proto": "https",
        "X-Forwarded-Host": "www.expressen.se"
      });

      const xhr = new page.window.XMLHttpRequest();
      const load = new Promise((resolve) => {
        xhr.onload = function onload() {
          resolve(JSON.parse(this.responseText));
        };
      });
      xhr.open("GET", "/req");
      xhr.setRequestHeader("X-My-Headers", "true");
      xhr.send();

      const body = await load;

      expect(body).to.have.property("headers");
      expect(body.headers).to.have.property("x-my-headers", "true");
      expect(body.headers).to.have.property("x-forwarded-host", "www.expressen.se");
      expect(body.headers).to.have.property("x-forwarded-proto", "https");
    });

    it("sends headers when calling external resource", async () => {
      const page = await tab.navigateTo("/", {
        "X-Forwarded-Proto": "https",
        "X-Forwarded-Host": "www.expressen.se",
      });

      nock("https://example.com")
        .get("/with-header")
        .reply(function () {
          const {headers} = this.req;
          if (headers["x-forwarded-proto"]) return [403, {}];
          return [200, {data: 1}];
        });

      const xhr = new page.window.XMLHttpRequest();
      const load = new Promise((resolve) => {
        xhr.onload = function onload() {
          resolve(JSON.parse(this.responseText));
        };
      });
      xhr.open("GET", "https://example.com/with-header");
      xhr.setRequestHeader("X-My-Headers", "true");
      xhr.send();

      const body = await load;
      expect(xhr.status).to.equal(200);

      expect(body).to.deep.equal({data: 1});
    });

    it("should attach cookies from req header to exactly the app host", async () => {
      const page = await Browser(port, {
        headers: {
          "X-Forwarded-Proto": "https",
          "X-Forwarded-Host": "www.expressen.se"
        }
      }).navigateTo("/", { cookie: "_ga=1" });

      let cookie;
      nock("https://blahonga.expressen.se")
        .get("/")
        .reply(function blahongaReply() {
          const {headers} = this.req;
          cookie = headers.cookie;
          return [200, {}];
        });

      const xhr = new page.window.XMLHttpRequest();
      const load = new Promise((resolve) => {
        xhr.onload = function onload() {
          resolve();
        };
      });
      xhr.open("GET", "https://blahonga.expressen.se/");
      xhr.send();

      await load;
      expect(cookie).to.be.undefined;
    });

    it("truthy withCredentials should use cookie jar when making external fetch requests", async () => {
      let page = Browser(app, {
        headers: {
          "X-Forwarded-Proto": "https",
          "X-Forwarded-Host": "www.expressen.se"
        }
      });
      page.jar.setCookies("_ga=1; Domain=.expressen.se; Path=/; Secure");

      page = await page.navigateTo("/");

      let cookie;
      nock("https://blahonga.expressen.se")
        .get("/")
        .reply(function blahongaReply() {
          const {headers} = this.req;
          cookie = headers.cookie;
          return [200, {}];
        });

      const xhr = new page.window.XMLHttpRequest();
      xhr.withCredentials = true;
      const load = new Promise((resolve) => {
        xhr.onload = resolve;
      });
      xhr.open("GET", "https://blahonga.expressen.se/");
      xhr.send();

      await load;
      expect(cookie).to.deep.equal("_ga=1");
    });

    it("falsy withCredentials sends no cookies when making external fetch requests", async () => {
      let page = Browser(app, {
        headers: {
          "X-Forwarded-Proto": "https",
          "X-Forwarded-Host": "www.expressen.se"
        }
      });
      page.jar.setCookies("_ga=1; Domain=.expressen.se; Path=/; Secure");

      page = await page.navigateTo("/");

      let cookie;
      nock("https://blahonga.expressen.se")
        .get("/")
        .reply(function blahongaReply() {
          const {headers} = this.req;
          cookie = headers.cookie;
          return [200, {}];
        });

      const xhr = new page.window.XMLHttpRequest();
      const load = new Promise((resolve) => {
        xhr.onload = resolve;
      });
      xhr.open("GET", "https://blahonga.expressen.se/");
      xhr.send();

      await load;
      expect(cookie).to.undefined;
    });
  });

  describe("readyState", () => {
    it("returns readyState on readystate change", async () => {
      const xhr = new browser.window.XMLHttpRequest();
      const readyStates = [xhr.readyState];

      xhr.open("GET", "/", true);
      readyStates.push(xhr.readyState);

      xhr.onprogress = function () {
        readyStates.push(xhr.readyState);
      };

      const load = new Promise((resolve) => {
        xhr.onload = function () {
          readyStates.push(xhr.readyState);
          resolve();
        };
      });

      xhr.send();

      await load;

      expect(readyStates).to.deep.equal([ 0, 1, 3, 4 ]);
    });

    it("returns status text with with different ready states", async () => {
      nock("http://example.com")
        .get("/")
        .reply(200, {data: 1});

      const xhr = new browser.window.XMLHttpRequest();
      const statusTexts = [xhr.statusText];

      xhr.open("GET", "http://example.com/", true);
      statusTexts.push(xhr.statusText);

      xhr.onprogress = function () {
        statusTexts.push(xhr.statusText);
      };

      const load = new Promise((resolve) => {
        xhr.onload = function () {
          statusTexts.push(xhr.statusText);
          resolve();
        };
      });

      xhr.send(null);

      await load;

      expect(statusTexts).to.deep.equal([
        "0 UNSENT",
        "1 OPENED",
        "3 LOADING",
        "4 DONE",
      ]);
    });
  });

  describe("status code", () => {
    it("status code is returned on external request", async () => {
      nock("http://example.com")
        .get("/")
        .reply(500, {});

      const xhr = new browser.window.XMLHttpRequest();
      const load = new Promise((resolve) => {
        xhr.onload = function onload() {
          resolve();
        };
      });
      xhr.open("GET", "http://example.com/");
      xhr.send();

      await load;

      expect(xhr).to.have.property("status", 500);
    });
  });

  describe("getAllResponseHeaders()", () => {
    it("returns response headers as raw text", async () => {
      const xhr = new browser.window.XMLHttpRequest();

      let allHeaders;
      xhr.open("GET", "/", true);
      xhr.onreadystatechange = function onreadystate() {
        if (this.readyState === XMLHttpRequestClass.HEADERS_RECEIVED) {
          allHeaders = this.getAllResponseHeaders();
        }
      };

      const load = new Promise((resolve) => {
        xhr.onload = resolve;
      });

      xhr.send();

      await load;

      const rows = allHeaders.split("\r\n");
      expect(rows).to.include("cache-control: public, max-age=0");
      expect(rows).to.include("content-type: text/html; charset=UTF-8");
    });

    it("set-cookie headers are not returned", async () => {
      const xhr = new browser.window.XMLHttpRequest();

      let allHeaders;
      xhr.open("GET", "/setcookie", true);
      xhr.onreadystatechange = function onreadystate() {
        if (this.readyState === XMLHttpRequestClass.HEADERS_RECEIVED) {
          allHeaders = this.getAllResponseHeaders();
        }
      };

      const load = new Promise((resolve) => {
        xhr.onload = resolve;
      });

      xhr.send();

      await load;

      let rows = allHeaders.split("\r\n");
      expect(rows).to.include("content-type: text/html; charset=UTF-8");
      for (const row of rows) {
        expect(row).to.not.match(/^set-cookie/);
      }

      rows = xhr.getAllResponseHeaders().split("\r\n");
      expect(rows).to.include("content-type: text/html; charset=UTF-8");
      for (const row of rows) {
        expect(row).to.not.match(/^set-cookie/);
      }
    });
  });
});
