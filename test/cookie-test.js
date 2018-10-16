"use strict";

const app = require("../app/app");
const Browser = require("../");
const nock = require("nock");
const {Compiler} = require("../lib/Compiler");

describe("cookies", () => {
  before(() => {
    Compiler([/assets\/scripts/]);
  });

  it("sets non-httponly cookies from response on document", async () => {
    const browser = await Browser(app).navigateTo("/setcookie");
    expect(browser.document.cookie).to.equal("regular_cookie=regular_cookie_value");
  });

  describe("fetch", () => {
    it("passes along cookies from original response", async () => {
      const browser = await Browser(app).navigateTo("/setcookie");
      const response = await browser.window.fetch("/req").then((res) => res.json());
      expect(response.cookie).to.equal("regular_cookie=regular_cookie_value;http_only_cookie=http_only_cookie_value");
    });

    it("remote resource on same top domain can set cookie on browser", async () => {
      const browser = await Browser(app).navigateTo("/", {
        host: "www.expressen.se",
      });

      nock("http://api.expressen.se")
        .get("/")
        .reply(200, null, {
          "set-cookie": [
            "apiToken=1; Path=/; Domain=expressen.se",
            "remoteToken=2; Path=/; Domain=expressen.se",
            "localToken=3; Path=/",
          ]
        });

      await browser.window.fetch("http://api.expressen.se/");

      const response = await browser.window.fetch("/req").then((res) => res.json());
      expect(response.cookie).to.equal("apiToken=1; remoteToken=2");
    });
  });
});
