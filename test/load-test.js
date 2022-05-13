"use strict";

const app = require("../app/app");
const Browser = require("../");
const http = require("http");
const nock = require("nock");
const { expect } = require("chai");

const PORT = process.env.PORT;

describe("load", () => {
  let server;
  before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, resolve);
    });
    process.env.PORT = server.address().port;
  });
  after(() => {
    process.env.PORT = PORT;
    server.close();
  });

  it("returns browser with window and document", async () => {
    const browser = await new Browser().load("");
    expect(browser.window).to.exist;
    expect(browser.document).to.exist;
  });

  it("runs script", async () => {
    const browser = await new Browser().load(`
      <title>Tallahassee</title>
      <script>document.title += " from script";</script>
    `);
    browser.runScripts();
    expect(browser.document.title).to.equal("Tallahassee from script");
  });

  it("fetches url relative to implicit origin", async () => {
    const browser = await new Browser().load("");
    return browser.window.fetch("/api").then((res) => res.json());
  });

  it("fetches url relative to explicit origin", async () => {
    const url = "https://www.expressen.se";
    nock(url)
      .get("/api")
      .reply(200, {});
    const browser = await new Browser(url).load("");
    return browser.window.fetch("/api").then((res) => res.json());
  });

  it("window has location from implicit host", async () => {
    const browser = await new Browser().load("");
    expect(browser.window.location.href).to.equal("http://127.0.0.1/");
  });

  it("window has location from forwarded host", async () => {
    const browser = await new Browser(undefined, {
      headers: {
        "x-forwarded-host": "www.expressen.se",
        "x-forwarded-proto": "https"
      }
    }).load("");
    expect(browser.window.location.href).to.equal("https://www.expressen.se/");
  });

  it("document has cookie from implicit host", async () => {
    const browser = await new Browser(undefined, {
      headers: {
        cookie: "myCookie=singoalla"
      }
    }).load();
    expect(browser.document.cookie).to.equal("myCookie=singoalla");
  });

  it("document has cookie from forwarded host", async () => {
    const browser = await new Browser(undefined, {
      headers: {
        cookie: "myCookie=singoalla",
        "x-forwarded-host": "www.expressen.se",
        "x-forwarded-proto": "https"
      }
    }).load();
    expect(browser.document.cookie).to.equal("myCookie=singoalla");
  });

  it("should be possible to pass options as first argument", async () => {
    const browser = await new Browser({
      headers: {
        cookie: "myCookie=ballerina",
      }
    }).load();
    expect(browser.document.cookie).to.equal("myCookie=ballerina");
  });
});
