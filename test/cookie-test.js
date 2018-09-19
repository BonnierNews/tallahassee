"use strict";

const app = require("../app/app");
const Browser = require("../");
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
  });
});
