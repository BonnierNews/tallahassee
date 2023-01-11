"use strict";

const app = require("../app/app");
const Browser = require("../");
const nock = require("nock");

describe("cookies", () => {
  describe("Browser", () => {
    it("exposes jar", async () => {
      const browser = Browser(app);
      expect(browser).to.have.property("jar");
    });

    it("jar holds browser cookies", async () => {
      const browser = Browser(app);

      browser.jar.setCookieSync("myCookie=singoalla; Path=/; Secure; HttpOnly", "http://127.0.0.1");

      const cookies = browser.jar.toJSON().cookies;
      expect(cookies.length).to.equal(1);
      expect(cookies[0]).to.include({
        key: "myCookie",
        path: "/",
        value: "singoalla",
        domain: "127.0.0.1",
        secure: true,
        httpOnly: true
      });
    });
  });

  describe("navigation", () => {
    it("navigating with cookie header sets cookies", async () => {
      const browser = Browser(app);

      await browser.navigateTo("/reply-with-cookies", {cookie: "myCookie=singoalla"});
      expect(browser.jar.getCookiesSync("http://127.0.0.1").length).to.be.ok;
    });

    it("navigating with set-cookie header sets cookies", async () => {
      const browser = Browser(app);

      await browser.navigateTo("/reply-with-cookies", {"set-cookie": "myCookie=singoalla"});
      expect(browser.jar.getCookiesSync("http://127.0.0.1").length).to.be.ok;
    });

    it("navigating with set-cookie array header sets cookies", async () => {
      const browser = Browser(app);

      await browser.navigateTo("/reply-with-cookies", {"set-cookie": ["myCookie=singoalla", "myOtherCookie=drommar"]});
      expect(browser.jar.getCookiesSync("http://127.0.0.1").length).to.equal(2);
    });

    it("navigating with set-cookie forwards cookie to backend", async () => {
      const browser = Browser(app);

      const page = await browser.navigateTo("/reply-with-cookies", {
        "host": "internal.cloud.io",
        "x-forwarded-host": "www.expressen.se",
        "x-forwarded-proto": "https",
        "set-cookie": [
          "myCookie=singoalla; Domain=expressen.se; Secure",
          "myOtherCookie=drommar; Domain=expressen.se; Secure; HttpOnly",
          "myNotSoSafeCookie=transfett; Domain=expressen.se",
        ]
      });

      expect(page.document.body.textContent).to.equal("myCookie=singoalla; myOtherCookie=drommar; myNotSoSafeCookie=transfett");
    });

    it("navigating with cookie header sets cookies on passed host", async () => {
      const browser = Browser(app, {
        headers: {
          "host": "www.expressen.se"
        }
      });

      await browser.navigateTo("/reply-with-cookies", {cookie: "myCookie=singoalla"});
      expect(browser.jar.getCookiesSync("http://www.expressen.se").length).to.be.ok;
      expect(browser.jar.getCookiesSync("http://blahonga.expressen.se").length).to.not.be.ok;
    });

    it("navigating with cookie header sets cookies on hostname", async () => {
      const browser = await Browser(app, {
        headers: {
          "x-forwarded-host": "www.expressen.se"
        }
      });

      await browser.navigateTo("/reply-with-cookies", {cookie: "myCookie=singoalla"});
      expect(browser.jar.getCookiesSync("http://www.expressen.se").length).to.be.ok;
      expect(browser.jar.getCookiesSync("http://blahonga.expressen.se").length).to.not.be.ok;
    });

    it("sends secure cookies with request with x-forwarded-proto https", async () => {
      const browser = Browser(app, {
        headers: {
          "x-forwarded-proto": "https"
        }
      });

      browser.jar.setCookieSync("myCookie=singoalla; Path=/; Secure; HttpOnly", "https://127.0.0.1");

      const page = await browser.navigateTo("/reply-with-cookies");
      expect(page.document.body.textContent).to.equal("myCookie=singoalla");
    });

    it("sends insecure cookies with request with x-forwarded-proto https", async () => {
      const browser = Browser(app, {
        headers: {
          "x-forwarded-proto": "https"
        }
      });

      browser.jar.setCookieSync("myCookie=singoalla; Path=/; HttpOnly", "http://127.0.0.1");

      const page = await browser.navigateTo("/reply-with-cookies");
      expect(page.document.body.textContent).to.equal("myCookie=singoalla");
    });

    it("sends secure cookies with request to secure url", async () => {
      const browser = Browser(app, {
        headers: {
          host: "www.expressen.se"
        }
      });

      browser.jar.setCookieSync("myCookie=singoalla; Path=/; Secure; HttpOnly", "https://www.expressen.se");

      const page = await browser.navigateTo("https://www.expressen.se/reply-with-cookies");
      expect(page.document.body.textContent).to.equal("myCookie=singoalla");
    });

    it("sends insecure cookies with request to secure url", async () => {
      const browser = Browser(app, {
        headers: {
          host: "www.expressen.se"
        }
      });

      browser.jar.setCookieSync("myCookie=singoalla; Path=/; HttpOnly", "http://www.expressen.se");

      const page = await browser.navigateTo("https://www.expressen.se/reply-with-cookies");
      expect(page.document.body.textContent).to.equal("myCookie=singoalla");
    });

    it("skips secure cookies to http endpoint", async () => {
      const browser = Browser(app);

      browser.jar.setCookieSync("myCookie=singoalla;path=/;Secure;HttpOnly", "http://127.0.0.1");

      const page = await browser.navigateTo("/reply-with-cookies");

      expect(page.document.body.textContent).to.not.be.ok;
    });

    it("assigns cookies to passed host header", async () => {
      const browser = Browser(app);
      const page = await browser.navigateTo("/reply-with-cookies", {
        host: "www.expressen.se"
      });
      expect(page.document.body.textContent).to.not.be.ok;
    });

    it("response with set cookies assigns cookies to passed host header", async () => {
      const browser = Browser(app);
      await browser.navigateTo("/setcookie", {
        host: "www.expressen.se"
      });

      expect(browser.jar.getCookiesSync("http://www.expressen.se", {allPaths: true}).length).to.equal(2);
    });

    it("host with port set cookies assigns cookies to hostname", async () => {
      const browser = Browser(app);
      await browser.navigateTo("/setcookie", {
        host: "www.expressen.se:443"
      });

      expect(browser.jar.getCookiesSync("http://www.expressen.se", {allPaths: true}).length).to.equal(2);
    });

    it("response with set cookies assigns cookies to passed x-forwarded-host header", async () => {
      const browser = Browser(app);
      await browser.navigateTo("/setcookie", {
        "x-forwarded-host": "www.expressen.se"
      });

      expect(browser.jar.getCookiesSync("http://www.expressen.se", {allPaths: true}).length).to.equal(2);
    });

    it("response with set cookie without explicit path sets cookie path to pathname", async () => {
      nock("https://www.example.com")
        .get("/slug")
        .reply(200, "<html/>", {
          "content-type": "text/html",
          "set-cookie": [
            "explicit=1",
            "domain=2; Path=/",
          ],
        });

      const browser = Browser("https://www.example.com");
      await browser.navigateTo("/slug");

      expect(browser.jar.getCookiesSync("http://www.example.com/slug").length).to.equal(2);
      expect(browser.jar.getCookiesSync("http://www.example.com").length).to.equal(0);
    });
  });

  describe("document", () => {
    it("sets script cookies from response on document", async () => {
      const browser = await Browser(app).navigateTo("/setcookie");
      expect(browser.window.document.cookie).to.equal("regular_cookie=regular_cookie_value");
    });

    it("disallows reading of secure cookies on insecure page", async () => {
      const browser = await Browser(app).navigateTo("/");
      browser.jar.setCookieSync("regular_cookie=1", "http://127.0.0.1");
      browser.jar.setCookieSync("secure_cookie=1; secure=true", "https://127.0.0.1");
      expect(browser.window.document.cookie).to.equal("regular_cookie=1");
    });

    it("allows reading of secure cookies on secure page", async () => {
      const browser = await Browser(app).navigateTo("/", {
        host: "www.expressen.se",
        "x-forwarded-proto": "https",
      });
      browser.jar.setCookieSync("regular_cookie=1", "http://www.expressen.se");
      browser.jar.setCookieSync("secure_cookie=1; secure=true", "https://www.expressen.se");
      expect(browser.window.document.cookie).to.equal("regular_cookie=1; secure_cookie=1");
    });
  });

  describe("fetch", () => {
    it("forwards cookies", async () => {
      const browser = await Browser(app).navigateTo("/", {cookie: "myCookie=singoalla"});
      const response = await browser.window.fetch("/req").then((res) => res.json());
      expect(response.cookie).to.equal("myCookie=singoalla");
    });

    it("sets cookies from origin response", async () => {
      const browser = await Browser(app).navigateTo("/setcookie");
      const response = await browser.window.fetch("/req").then((res) => res.json());
      expect(response.cookie).to.equal("regular_cookie=regular_cookie_value; http_only_cookie=http_only_cookie_value");
    });

    it("remote resource on same top domain can set cookie on browser", async () => {
      const browser = await Browser(app).navigateTo("/", {
        host: "www.expressen.se",
        "x-forwarded-proto": "https",
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

    it("redirect can overwrite cookies", async () => {
      const browser = await Browser(app).navigateTo("/", {
        host: "www.expressen.se",
        "x-forwarded-proto": "https",
      });

      browser.jar.setCookie("apiToken=0; Path=/; Domain=expressen.se");

      nock("http://api.expressen.se")
        .get("/")
        .reply(307, null, {
          "set-cookie": [
            "apiToken=1; Path=/; Domain=expressen.se",
            "remoteToken=2; Path=/; Domain=expressen.se",
            "localToken=3; Path=/",
          ],
          location: "https://www.expressen.se/req",
        });

      await browser.window.fetch("http://api.expressen.se/");

      expect(browser.document.cookie).to.equal("apiToken=1; remoteToken=2");
    });
  });
});
