"use strict";

const nock = require("nock");
const path = require("path");
const Script = require("@bonniernews/wichita");

const { app } = require("../app/app.js");
const Browser = require("../index.js");

describe("Tallahassee", () => {
  describe("navigateTo()", () => {
    it("navigates to url", async () => {
      await new Browser(app).navigateTo("/");
    });

    it("returns browser window", async () => {
      const browser = await new Browser(app).navigateTo("/");
      expect(browser.window).to.be.ok;
    });

    it("sets browser window location", async () => {
      const browser = await new Browser(app).navigateTo("/", {
        Host: "www.expressen.se",
        "x-forwarded-proto": "https",
      });
      expect(browser.window).to.be.ok;
      expect(browser.window.location.protocol).to.equal("https:");
      expect(browser.window.location.host).to.equal("www.expressen.se");
    });

    it("exposes http response", async () => {
      const browser = await new Browser(app).navigateTo("/");
      expect(browser.response).to.be.ok;
      expect(browser.response).to.have.property("status", 200);
      expect(browser.response).to.have.property("headers");
      expect(browser.response.headers.get("content-type")).to.equal("text/html; charset=UTF-8");
    });

    it("throws if not 200", async () => {
      try {
        await new Browser(app).navigateTo("/404");
      } catch (e) {
        var err = e; // eslint-disable-line no-var
      }
      expect(err).to.be.ok;
    });

    it("passes along cookies", async () => {
      const browser = await new Browser(app).navigateTo("/reply-with-cookies", { cookie: "myCookie=singoalla;mySecondCookie=chocolateChip" });
      expect(browser.$("body").text()).to.equal("myCookie=singoalla; mySecondCookie=chocolateChip");
    });

    it("returns browser with navigateTo capability that returns new browser with preserved cookie", async () => {
      const browser = await new Browser(app).navigateTo("/", { cookie: "myCookie=singoalla;mySecondCookie=chocolateChip" });

      const newBrowser = await browser.navigateTo("/reply-with-cookies");

      expect(newBrowser.$("body").text()).to.equal("myCookie=singoalla; mySecondCookie=chocolateChip");
    });

    it("follows redirects", async () => {
      const browser = await new Browser(app).navigateTo("/redirect");
      expect(browser.response).to.be.ok;
      expect(browser.response).to.have.property("status", 200);
      expect(browser.window.location.pathname).to.equal("/req-info-html");
    });

    it("keeps original request headers when it follows local redirects", async () => {
      const browser = await new Browser(app).navigateTo("/redirect", {
        host: "www.expressen.se",
        "x-forwarded-proto": "https",
      });
      expect(browser.response).to.be.ok;
      const reqInfo = JSON.parse(browser.$("body").text());
      expect(reqInfo.reqHeaders).to.have.property("host", "www.expressen.se");
      expect(reqInfo.reqHeaders).to.have.property("x-forwarded-proto", "https");
    });

    it("only sends specified headers when following local redirects", async () => {
      nock("https://www.example.com")
        .get("/")
        .reply(302, "", { location: "https://www.expressen.se/req-info-html" });
      const browser = await new Browser(app).navigateTo("/external-redirect", {
        host: "www.expressen.se",
        "x-forwarded-proto": "https",
      });
      expect(browser.response).to.be.ok;
      const reqInfo = JSON.parse(browser.$("body").text());
      expect(reqInfo.reqHeaders).to.have.property("host", "www.expressen.se");
      expect(reqInfo.reqHeaders).to.have.property("x-forwarded-proto", "https");
    });

    it("handles redirect loops by throwing", (done) => {
      new Browser(app).navigateTo("/redirect-loop")
        .catch(() => {
          done();
        });
    });

    it("makes request to local app when the requested host matches host header from browser creation", async () => {
      let browser = await new Browser(app, { headers: { host: "www.expressen.se" } }).navigateTo("/");
      browser = await browser.navigateTo("http://www.expressen.se/");
      expect(browser.response).to.be.ok;
    });

    it("makes request to local app when the requested host matches x-forwarded-host from browser creation", async () => {
      let browser = await new Browser(app, {
        headers: {
          host: "some-other-host.com",
          "x-forwarded-host": "www.expressen.se",
        },
      }).navigateTo("/");
      browser = await browser.navigateTo("http://www.expressen.se/");
      expect(browser.response).to.be.ok;
    });

    it("makes request to local app when the requested host matches x-forwarded-host and protocol matches x-forwarded-proto from browser creation", async () => {
      let browser = await new Browser(app, {
        headers: {
          host: "some-other-host.com",
          "x-forwarded-host": "www.expressen.se",
          "x-forwarded-proto": "https",
        },
      }).navigateTo("/");
      browser = await browser.navigateTo("https://www.expressen.se/");
      expect(browser.response).to.be.ok;
    });

    it("makes request to local app when the requested host matches x-forwarded-host and protocol matches x-forwarded-proto from navigation", async () => {
      let browser = await new Browser(app).navigateTo("/", {
        host: "some-other-host.com",
        "x-forwarded-host": "www.expressen.se",
        "x-forwarded-proto": "https",
      });
      browser = await browser.navigateTo("https://www.expressen.se/");
      expect(browser.response).to.be.ok;
    });

    it("passes cookie if host is specified", async () => {
      const browser = await new Browser(app).navigateTo("/reply-with-cookies", {
        host: "www.expressen.se",
        cookie: "myCookie=singoalla;mySecondCookie=chocolateChip",
      });
      expect(browser.$("body").text()).to.equal("myCookie=singoalla; mySecondCookie=chocolateChip");
    });

    it("passes cookie if options.host is specified", async () => {
      const browser = await new Browser(app, { headers: { host: "www.expressen.se" } }).navigateTo("/reply-with-cookies", { cookie: "myCookie=singoalla;mySecondCookie=chocolateChip" });
      expect(browser.$("body").text()).to.equal("myCookie=singoalla; mySecondCookie=chocolateChip");
    });

    it("passes cookie if options.x-forwarded-host is specified", async () => {
      const browser = await new Browser(app, {
        headers: {
          host: "some-other-host.com",
          "x-forwarded-host": "www.expressen.se",
        },
      }).navigateTo("/reply-with-cookies", { cookie: "myCookie=singoalla; mySecondCookie=chocolateChip" });
      expect(browser.$("body").text()).to.equal("myCookie=singoalla; mySecondCookie=chocolateChip");
    });

    it("passes cookie if options.x-forwarded-host is specified", async () => {
      const browser = await new Browser(app, {
        headers: {
          host: "some-other-host.com",
          "x-forwarded-host": "www.expressen.se",
        },
      }).navigateTo("/reply-with-cookies", { cookie: "myCookie=singoalla; mySecondCookie=chocolateChip" });
      expect(browser.$("body").text()).to.equal("myCookie=singoalla; mySecondCookie=chocolateChip");
    });
  });

  describe("runScript(scriptElement)", () => {
    let browser;

    beforeEach(async () => {
      browser = await new Browser(app).navigateTo("/");
    });

    it("runs supplied script element", () => {
      expect(browser.document.documentElement.classList.contains("no-js")).to.be.true;
      expect(browser.window).to.not.have.property("scriptsAreExecutedInBody");

      const scriptElement = browser.document.getElementById("implicit-javascript-script");
      expect(scriptElement).to.exist;

      browser.runScript(scriptElement);

      expect(browser.document.documentElement.classList.contains("no-js")).to.be.false;
      expect(browser.window).to.not.have.property("scriptsAreExecutedInBody");
    });

    it("does not run if script type is 'module'", () => {
      const scriptElement = browser.document.getElementById("module-script");
      expect(scriptElement).to.exist;
      expect(scriptElement.type).to.equal("module");

      browser.runScript(scriptElement);

      expect(browser.window.moduleScriptExecuted).to.be.undefined;
    });

    it("does not run if script is not JavaScript", () => {
      const dataBlockScript = browser.document.getElementById("data-block-script");
      expect(dataBlockScript).to.exist;
      expect(dataBlockScript.type).to.equal("application/ld+json");

      const customScript = browser.document.getElementById("custom-script");
      expect(customScript).to.exist;
      expect(customScript.type).to.equal("custom/javascript");

      browser.runScript(dataBlockScript);
      browser.runScript(customScript);

      expect(browser.window.customScriptIgnoredFailed).to.be.undefined;
      expect(browser.window).to.not.have.property("scriptsAreExecutedInBody");
    });

    it("runs supplied legacy script", () => {
      expect(browser.window.legacyScriptExecuted).to.be.undefined;

      const legacyScript = browser.document.getElementById("legacy-script");
      expect(legacyScript).to.exist;
      expect(legacyScript.type).to.equal("application/javascript");

      browser.runScript(legacyScript);

      expect(browser.window.legacyScriptExecuted).to.be.true;
    });
  });

  describe("runScripts(scopeElement)", () => {
    let browser;

    beforeEach(async () => {
      browser = await new Browser(app).navigateTo("/");
    });

    it("runs all scripts without scope element", () => {
      expect(browser.document.documentElement.classList.contains("no-js")).to.be.true;
      expect(browser.window).to.not.have.property("scriptsAreExecutedInBody");

      browser.runScripts();

      expect(browser.document.documentElement.classList.contains("no-js")).to.be.false;
      expect(browser.window).to.have.property("scriptsAreExecutedInBody", true);
    });

    it("runs scripts within supplied scope element", () => {
      expect(browser.document.documentElement.classList.contains("no-js")).to.be.true;
      expect(browser.window).to.not.have.property("scriptsAreExecutedInBody");

      browser.runScripts(browser.document.head);

      expect(browser.document.documentElement.classList.contains("no-js")).to.be.false;
      expect(browser.window).to.not.have.property("scriptsAreExecutedInBody");
    });
  });

  describe("document", () => {
    it("expose current window on document", async () => {
      const browser = await new Browser(app).navigateTo("/");
      expect(browser.document).to.have.property("defaultView").that.equal(browser.window);
    });

    it("doesn't expose classList on document", async () => {
      const browser = await new Browser(app).navigateTo("/");
      expect(browser.document.classList, "classList on document").to.be.undefined;
    });

    it("sets cookie on document", async () => {
      const browser = await new Browser(app).navigateTo("/", { cookie: "_ga=12" });

      expect(browser.document).to.have.property("cookie", "_ga=12");
    });

    it("sets cookie on document disregarding casing", async () => {
      const browser = await new Browser(app).navigateTo("/", { CookIe: "_ga=13" });

      expect(browser.document).to.have.property("cookie", "_ga=13");
    });

    it("sets multiple cookies on document", async () => {
      const browser = await new Browser(app).navigateTo("/", { cookie: "cookie1=abc;cookie2=def" });

      expect(browser.document).to.have.property("cookie", "cookie1=abc; cookie2=def");
    });

    it("sets multiple cookies on document disregarding whitespace and empty values", async () => {
      const browser = await new Browser(app).navigateTo("/", { cookie: " cookie1=abc; cookie2=def; ;   ;\tcookie3=ghi;; ;   ;" });

      expect(browser.document).to.have.property("cookie", "cookie1=abc; cookie2=def; cookie3=ghi");
    });

    it("sets referer from navigation headers", async () => {
      const browser = await new Browser(app).navigateTo("/", { referer: "https://www.example.com" });

      expect(browser.document).to.have.property("referrer", "https://www.example.com");
    });
  });

  describe("window", () => {
    it("exposes a document property", async () => {
      const browser = await new Browser(app).navigateTo("/");

      expect(browser.window.document === browser.document).to.be.true;
    });

    it("exposes navigator property with userAgent from options", async () => {
      const browser = await new Browser(app, { headers: { "User-Agent": "Mozilla 5.0" } }).navigateTo("/");

      expect(browser.window.navigator).to.be.ok;
      expect(browser.window.navigator).to.have.property("userAgent", "Mozilla 5.0");
    });

    it("exposes navigator property with userAgent from navigateTo headers", async () => {
      const browser = await new Browser(app).navigateTo("/", { "User-Agent": "Mozilla 5.0" });

      expect(browser.window.navigator).to.be.ok;
      expect(browser.window.navigator).to.have.property("userAgent", "Mozilla 5.0");
    });
  });

  describe("run script", () => {
    it("runs es6 script with browser window as global", async () => {
      const browser = await new Browser(app).navigateTo("/", { cookie: "_ga=1" });
      expect(browser.document.cookie).to.equal("_ga=1");

      await new Script(path.resolve("app/assets/scripts/main.js")).run(browser.window);

      expect(browser.document.getElementsByClassName("set-by-js").length).to.equal(1);
    });

    it("again", async () => {
      const browser = await new Browser(app).navigateTo("/");

      await new Script(path.resolve("app/assets/scripts/main.js")).run(browser.window);

      expect(browser.document.cookie).to.equal("");
      expect(browser.document.getElementsByClassName("set-by-js").length).to.equal(0);
    });
  });

  describe("focusIframe()", () => {
    it("iframe from same host scopes window and document and sets frameElement and inherits cookie", async () => {
      const browser = await new Browser(app).navigateTo("/", { cookie: "_ga=2" });

      const element = browser.document.createElement("iframe");
      element.id = "friendly-frame";
      element.src = "/friendly/";
      browser.document.body.appendChild(element);

      const iframe = browser.document.getElementById("friendly-frame");
      const iframeScope = await browser.focusIframe(iframe);

      expect(iframeScope.window === browser.window, "scoped window").to.be.false;
      expect(iframeScope.window.top === browser.window, "window.top").to.be.true;
      expect(iframeScope.document === browser.document, "scoped document").to.be.false;
      expect(iframeScope.document.cookie, "scoped document cookie").to.equal("_ga=2");
      expect(iframeScope.window.frameElement === iframe, "window.frameElement property").to.be.true;
    });

    it("iframe from other host scopes window and document", async () => {
      nock("http://example.com")
        .get("/framed-content")
        .replyWithFile(200, path.resolve("app/assets/public", "index.html"), { "Content-Type": "text/html" });

      const browser = await new Browser(app).navigateTo("/", { cookie: "_ga=2" });

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
      const browser = await new Browser(app).navigateTo("/404", null, 404);
      expect(browser.document.getElementsByTagName("h1")[0].textContent).to.equal("Apocalyptic");
    });
  });
});
