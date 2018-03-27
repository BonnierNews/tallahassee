"use strict";

const app = require("../app/app");
const Browser = require("../");
const nock = require("nock");
const Path = require("path");
const {Compiler} = require("../lib/Compiler");

describe("Tallahassee", () => {
  before(() => {
    Compiler([/assets\/scripts/]);
  });

  describe("navigateTo()", () => {
    it("navigates to url", async () => {
      await Browser(app).navigateTo("/");
    });

    it("returns browser window", async () => {
      const browser = await Browser(app).navigateTo("/");
      expect(browser.window).to.be.ok;
    });

    it("sets browser window location", async () => {
      const browser = await Browser(app).navigateTo("/", {
        Host: "www.expressen.se"
      });
      expect(browser.window).to.be.ok;
      expect(browser.window.location.host).to.equal("www.expressen.se");
    });

    it("exposes http response", async () => {
      const browser = await Browser(app).navigateTo("/");
      expect(browser.response).to.be.ok;
      expect(browser.response).to.have.property("statusCode", 200);
      expect(browser.response).to.have.property("headers").that.deep.include({
        "content-type": "text/html; charset=UTF-8"
      });
    });

    it("throws if not 200", async () => {
      try {
        await Browser(app).navigateTo("/404");
      } catch (e) {
        var err = e; // eslint-disable-line no-var
      }
      expect(err).to.be.ok;
    });
  });

  describe("runScripts()", () => {
    let browser;

    beforeEach(async () => {
      browser = await Browser(app).navigateTo("/");
    });

    it("runs all scripts without context", () => {
      expect(browser.document.documentElement.classList.contains("no-js")).to.be.true;
      expect(browser.window).to.not.have.property("scriptsAreExecutedInBody");

      browser.runScripts();

      expect(browser.document.documentElement.classList.contains("no-js")).to.be.false;
      expect(browser.window).to.have.property("scriptsAreExecutedInBody", true);
    });

    it("runs scripts within supplied context", () => {
      expect(browser.document.documentElement.classList.contains("no-js")).to.be.true;
      expect(browser.window).to.not.have.property("scriptsAreExecutedInBody");

      browser.runScripts(browser.document.head);

      expect(browser.document.documentElement.classList.contains("no-js")).to.be.false;
      expect(browser.window).to.not.have.property("scriptsAreExecutedInBody");
    });
  });

  describe("document", () => {
    it("doesn't expose classList on document", async () => {
      const browser = await Browser(app).navigateTo("/");
      expect(browser.document.classList, "classList on document").to.be.undefined;
    });

    it("sets cookie on document", async () => {
      const browser = await Browser(app).navigateTo("/", {
        cookie: "_ga=12"
      });

      expect(browser.document).to.have.property("cookie", "_ga=12;");
    });

    it("sets cookie on document disregarding casing", async () => {
      const browser = await Browser(app).navigateTo("/", {
        CookIe: "_ga=13;"
      });

      expect(browser.document).to.have.property("cookie", "_ga=13;");
    });
  });

  describe("window", () => {
    it("exposes a document property", async () => {
      const browser = await Browser(app).navigateTo("/");

      expect(browser.window.document === browser.document).to.be.true;
    });
  });

  describe("run script", () => {
    it("transpiles and runs es6 script", async () => {
      const browser = await Browser(app).navigateTo("/", {
        Cookie: "_ga=1"
      });

      require("../app/assets/scripts/main");

      expect(browser.document.cookie).to.equal("_ga=1;");
      expect(browser.document.getElementsByClassName("set-by-js")).to.have.length(1);
    });

    it("again", async () => {
      const browser = await Browser(app).navigateTo("/");

      require("../app/assets/scripts/main");

      expect(browser.document.cookie).to.equal("");
      expect(browser.document.getElementsByClassName("set-by-js")).to.have.length(0);
    });
  });

  describe("window.fetch", () => {
    beforeEach(nock.cleanAll);

    it("external resource is supported", async () => {
      const browser = await Browser(app).navigateTo("/");

      nock("http://example.com")
        .get("/")
        .reply(200, {data: 1});

      const body = await browser.window.fetch("http://example.com/").then((res) => res.json());
      expect(body).to.eql({data: 1});
    });

    it("local resource routes to app", async () => {
      const browser = await Browser(app).navigateTo("/");

      const body = await browser.window.fetch("/api").then((res) => res.json());
      expect(body).to.eql({data: 1});
    });

    it("passes cookie to local resource", async () => {
      const browser = await Browser(app).navigateTo("/", {
        cookie: "_ga=1;"
      });

      const body = await browser.window.fetch("/req").then((res) => res.json());
      expect(body).to.have.property("cookie", "_ga=1;");
    });

    it("passes the request headers to local resource", async () => {
      const browser = await Browser(app).navigateTo("/", {
        "X-Forwarded-Proto": "https",
        "X-Forwarded-Host": "www.expressen.se"
      });

      const body = await browser.window.fetch("/req").then((res) => res.json());

      expect(body).to.have.property("headers");
      expect(body.headers).to.have.property("x-forwarded-host", "www.expressen.se");
      expect(body.headers).to.have.property("x-forwarded-proto", "https");
    });

    it("sends fetch headers when calling local resource", async () => {
      const browser = await Browser(app).navigateTo("/", {
        "X-Forwarded-Proto": "https",
        "X-Forwarded-Host": "www.expressen.se"
      });

      const body = await browser.window.fetch("/req", {
        headers: {
          "X-My-Headers": "true"
        }
      }).then((res) => res.json());

      expect(body).to.have.property("headers");
      expect(body.headers).to.have.property("x-my-headers", "true");
      expect(body.headers).to.have.property("x-forwarded-host", "www.expressen.se");
      expect(body.headers).to.have.property("x-forwarded-proto", "https");
    });

    it("sends fetch headers when calling external resource", async () => {
      const browser = await Browser(app).navigateTo("/", {
        "X-Forwarded-Proto": "https",
        "X-Forwarded-Host": "www.expressen.se",
        cookie: "_ga=1"
      });

      nock("http://example.com")
        .get("/with-header")
        .reply(function () {
          const {headers} = this.req;
          if (headers.cookie) return [401, {}];
          if (headers["x-forwarded-proto"]) return [403, {}];
          return [200, {data: 1}];
        });

      const body = await browser.window.fetch("http://example.com/with-header", {
        headers: {
          "X-My-Headers": "true"
        }
      }).then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        return res;
      }).then((res) => res.json());

      expect(body).to.eql({data: 1});
    });
  });

  describe("submit", () => {
    it("submits get form on click", async () => {
      const browser = await Browser(app).navigateTo("/", {cookie: "_ga=2"});

      const form = browser.document.getElementById("get-form");
      const [input] = form.getElementsByTagName("input");
      const [button] = form.getElementsByTagName("button");

      input.name = "q";
      input.value = "12";

      button.click();

      expect(browser._pending).to.be.ok;

      const newNavigation = await browser._pending;

      expect(newNavigation.document.cookie).to.equal("_ga=2;");
      expect(newNavigation.window.location).to.have.property("search", "?q=12");
    });
  });

  describe("focusIframe()", () => {
    it("iframe from same host scopes window and document and sets frameElement and inherits cookie", async () => {
      const browser = await Browser(app).navigateTo("/", {cookie: "_ga=2;"});

      const element = browser.document.createElement("iframe");
      element.id = "friendly-frame";
      element.src = "/friendly/";
      browser.document.body.appendChild(element);

      const iframe = browser.document.getElementById("friendly-frame");
      const iframeScope = await browser.focusIframe(iframe);

      expect(iframeScope.window === browser.window, "scoped window").to.be.false;
      expect(iframeScope.window.top === browser.window, "window.top").to.be.true;
      expect(iframeScope.document === browser.document, "scoped document").to.be.false;
      expect(iframeScope.document.cookie, "scoped document cookie").to.equal("_ga=2;");
      expect(iframeScope.window.frameElement === iframe, "window.frameElement property").to.be.true;
    });

    it("iframe from other host scopes window and document", async () => {
      nock("http://example.com")
        .get("/framed-content")
        .replyWithFile(200, Path.join(__dirname, "../app/assets/public/index.html"), {
          "Content-Type": "text/html"
        });

      const browser = await Browser(app).navigateTo("/", {cookie: "_ga=2"});

      const element = browser.document.createElement("iframe");
      element.id = "iframe";
      element.src = "//example.com/framed-content";
      browser.document.body.appendChild(element);

      const iframe = browser.document.getElementById("iframe");
      const iframeScope = await browser.focusIframe(iframe);

      expect(iframeScope.window === browser.window, "scoped window").to.be.false;
      expect(iframeScope.window.top, "window.top").to.be.ok;

      expect(() => iframeScope.window.top.location.pathname).to.throw("Blocked a frame with origin \"http://example.com\" from accessing a cross-origin frame.");

      expect(iframeScope.document === browser.document, "scoped document").to.be.false;
      expect(iframeScope.document.cookie, "scoped document cookie").to.equal("");
      expect(iframeScope.window.frameElement, "window.frameElement property").to.be.undefined;
    });
  });

  describe("non 200 response", () => {
    it("can override expected status code", async () => {
      const browser = await Browser(app).navigateTo("/404", null, 404);
      expect(browser.document.getElementsByTagName("h1")[0].innerText).to.equal("Apocalyptic");
    });

  });
});
