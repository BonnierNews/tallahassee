"use strict";

const app = require("../app/app");
const Browser = require("../");
const nock = require("nock");
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

    it("throws if not 200", async () => {
      try {
        await Browser(app).navigateTo("/../");
      } catch (e) {
        var err = e; // eslint-disable-line no-var
      }
      expect(err).to.be.ok;
    });
  });

  describe("document", () => {
    it("doesn't expose classList on document", async () => {
      const browser = await Browser(app).navigateTo("/");
      expect(browser.document.classList, "classList on document").to.be.undefined;
    });

    it("exposes classList on elements", async () => {
      const browser = await Browser(app).navigateTo("/");
      const [elm] = browser.document.getElementsByTagName("h1");

      expect(elm.classList).to.be.ok;
      elm.classList.add("class-list");

      expect(elm.classList._classes).to.contain("class-list");

      elm.classList.toggle("class-list");
      expect(elm.classList._classes).to.not.contain("class-list");

      elm.classList.toggle("class-list", false);
      expect(elm.classList._classes).to.not.contain("class-list");

      elm.classList.toggle("class-list", true);
      expect(elm.classList._classes).to.contain("class-list");

      elm.classList.toggle("class-list");
      expect(elm.classList._classes).to.not.contain("class-list");

      elm.classList.add("class-list", "second-class");
      expect(elm.classList._classes).to.include.members(["class-list", "second-class"]);

      elm.classList.remove("class-list", "second-class");
      expect(elm.classList._classes).to.not.include.members(["class-list", "second-class"]);
    });

    it("sets cookie on document", async () => {
      const browser = await Browser(app).navigateTo("/", {
        cookie: "_ga=12"
      });

      expect(browser.document).to.have.property("cookie", "_ga=12");
    });

    it("sets cookie on document disregarding casing", async () => {
      const browser = await Browser(app).navigateTo("/", {
        CookIe: "_ga=13"
      });

      expect(browser.document).to.have.property("cookie", "_ga=13");
    });
  });

  describe("run script", () => {
    it("transpiles and runs es6 script", async () => {
      const browser = await Browser(app).navigateTo("/", {
        Cookie: "_ga=1"
      });

      require("../app/assets/scripts/main");

      expect(browser.document.cookie).to.equal("_ga=1");
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
        cookie: "_ga=1"
      });

      const body = await browser.window.fetch("/cookie").then((res) => res.json());
      expect(body).to.eql({cookie: "_ga=1"});
    });
  });
});
