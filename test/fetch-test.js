"use strict";

const express = require("express");
const nock = require("nock");

const { app } = require("../app/app.js");
const Browser = require("../index.js");

describe("window.fetch", () => {
  beforeEach(nock.cleanAll);

  it("external resource is supported", async () => {
    const browser = await new Browser(app).navigateTo("/");

    nock("http://example.com")
      .get("/")
      .reply(200, { data: 1 });

    const body = await browser.window.fetch("http://example.com/").then((res) => res.json());
    expect(body).to.eql({ data: 1 });
  });

  it("external post is supported", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const json = JSON.stringify({ foo: "bar" });
    nock("http://example.com")
      .post("/", json)
      .reply(200, { data: 1 });

    const body = await browser.window.fetch("http://example.com/", {
      method: "POST",
      body: json,
    }).then((res) => res.json());
    expect(body).to.eql({ data: 1 });
  });

  it("local post is supported", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const json = JSON.stringify({ foo: "bar" });

    const body = await browser.window.fetch("/post", {
      method: "POST",
      body: json,
    }).then((res) => res.json());
    expect(body).to.eql({ data: 1 });
  });

  it("external delete is supported", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const json = JSON.stringify({ foo: "bar" });
    nock("http://example.com")
      .delete("/", json)
      .reply(200, { data: 1 });

    const body = await browser.window.fetch("http://example.com/", {
      method: "DELETE",
      body: json,
    }).then((res) => res.json());
    expect(body).to.eql({ data: 1 });
  });

  it("local delete is supported", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const json = JSON.stringify({ foo: "bar" });

    const body = await browser.window.fetch("/delete", {
      method: "DELETE",
      body: json,
    }).then((res) => res.json());
    expect(body).to.eql({ data: 1 });
  });

  it("external put is supported", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const json = JSON.stringify({ foo: "bar" });
    nock("http://example.com")
      .put("/", json)
      .reply(200, { data: 1 });

    const body = await browser.window.fetch("http://example.com/", {
      method: "PUT",
      body: json,
    }).then((res) => res.json());
    expect(body).to.eql({ data: 1 });
  });

  it("local put is supported", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const json = JSON.stringify({ foo: "bar" });

    const body = await browser.window.fetch("/put", {
      method: "PUT",
      body: json,
    }).then((res) => res.json());
    expect(body).to.eql({ data: 1 });
  });

  it("local head is supported", async () => {
    const browser = await new Browser(app).navigateTo("/");
    const status = await browser.window.fetch("/head", { method: "HEAD" }).then((res) => res.status);

    expect(status).to.eql(418);
  });

  it("local resource routes to app", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const body = await browser.window.fetch("/api").then((res) => res.json());
    expect(body).to.eql({ data: 1 });
  });

  it("local resource routes to app if host match", async () => {
    const browser = await new Browser(app).navigateTo("/", {
      host: "www.expressen.se",
      "x-forwarded-proto": "https",
    });

    const body = await browser.window.fetch("https://www.expressen.se/api").then((res) => res.json());

    expect(body).to.eql({ data: 1 });
  });

  it("local resource routes to app if x-forwarded-host match", async () => {
    const browser = await new Browser(app).navigateTo("/", { host: "some-other-host.com", "x-forwarded-host": "www.expressen.se", "x-forwarded-proto": "https" });

    const body = await browser.window.fetch("https://www.expressen.se/api").then((res) => res.json());

    expect(body).to.eql({ data: 1 });
  });

  it("passes cookie to local resource", async () => {
    const browser = await new Browser(app).navigateTo("/", { cookie: "_ga=1" });

    const body = await browser.window.fetch("/req").then((res) => res.json());
    expect(body).to.have.property("cookie", "_ga=1");
  });

  it("passes the request headers to local resource", async () => {
    const browser = await new Browser(app).navigateTo("/", {
      "X-Forwarded-Proto": "https",
      "X-Forwarded-Host": "www.expressen.se",
    });

    const body = await browser.window.fetch("/req").then((res) => res.json());

    expect(body).to.have.property("headers");
    expect(body.headers).to.have.property("x-forwarded-host", "www.expressen.se");
    expect(body.headers).to.have.property("x-forwarded-proto", "https");
  });

  it("sends fetch headers when calling local resource", async () => {
    const browser = await new Browser(app).navigateTo("/", {
      "X-Forwarded-Proto": "https",
      "X-Forwarded-Host": "www.expressen.se",
    });

    const body = await browser.window.fetch("/req", { headers: { "X-My-Headers": "true" } }).then((res) => res.json());

    expect(body).to.have.property("headers");
    expect(body.headers).to.have.property("x-my-headers", "true");
    expect(body.headers).to.have.property("x-forwarded-host", "www.expressen.se");
    expect(body.headers).to.have.property("x-forwarded-proto", "https");
  });

  it("sends fetch headers when calling external resource", async () => {
    const browser = await new Browser(app).navigateTo("/", {
      "X-Forwarded-Proto": "https",
      "X-Forwarded-Host": "www.expressen.se",
    });

    nock("http://example.com")
      .get("/with-header")
      .reply(function () {
        const { headers } = this.req;
        if (headers["x-forwarded-proto"]) return [ 403, {} ];
        return [ 200, { data: 1 } ];
      });

    const body = await browser.window.fetch("http://example.com/with-header", { headers: { "X-My-Headers": "true" } }).then((res) => {
      if (res.status !== 200) throw new Error(res.status);
      return res;
    }).then((res) => res.json());

    expect(body).to.eql({ data: 1 });
  });

  it("resolves to object with ok property set to true when successfull external request", async () => {
    const browser = await new Browser(app).navigateTo("/");

    nock("http://example.com")
      .get("/")
      .reply(200, { data: 1 });

    const response = await browser.window.fetch("http://example.com/");
    expect(response).to.have.property("ok", true);
  });

  it("resolves to object with ok property set to false when response is 404 to external request", async () => {
    const browser = await new Browser(app).navigateTo("/");

    nock("http://example.com")
      .get("/")
      .reply(404, {});

    const response = await browser.window.fetch("http://example.com/");
    expect(response).to.have.property("ok", false);
  });

  it("resolves to object with ok property set to false when response is 500 to external request", async () => {
    const browser = await new Browser(app).navigateTo("/");

    nock("http://example.com")
      .get("/")
      .reply(500, {});

    const response = await browser.window.fetch("http://example.com/");
    expect(response).to.have.property("ok", false);
  });

  it("resolves to object with ok property set to true when successfull local request", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const response = await browser.window.fetch("/req");
    expect(response).to.have.property("ok", true);
  });

  it("resolves to object with ok property set to false when response is 404 to local request", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const response = await browser.window.fetch("/404");
    expect(response).to.have.property("ok", false);
  });

  it("resolves to object with ok property set to false when response is 500 to local request", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const response = await browser.window.fetch("/err");
    expect(response).to.have.property("ok", false);
  });

  it("local resource res.text returns promise", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const res = await browser.window.fetch("/partial.html");
    expect(res.text()).to.be.a("promise");
  });

  it("local resource res.json returns promise", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const res = await browser.window.fetch("/api");
    expect(res.json()).to.be.a("promise");
  });

  it("should attach cookies from req header to exactly the app host", async () => {
    const browser = await new Browser(app, {
      headers: {
        "X-Forwarded-Proto": "https",
        "X-Forwarded-Host": "www.expressen.se",
      },
    }).navigateTo("/", { cookie: "_ga=1" });

    let cookie;
    nock("https://blahonga.expressen.se")
      .get("/")
      .reply(function blahongaReply() {
        const { headers } = this.req;
        cookie = headers.cookie;
        return [ 200, {} ];
      });

    await browser.window.fetch("https://blahonga.expressen.se/");
    expect(cookie).to.equal(undefined);
  });

  it("should use cookie jar when making external fetch requests", async () => {
    let browser = new Browser(app, {
      headers: {
        "X-Forwarded-Proto": "https",
        "X-Forwarded-Host": "www.expressen.se",
      },
    });
    browser.jar.setCookies("_ga=1; Domain=.expressen.se; Path=/;Secure");

    browser = await browser.navigateTo("/");

    let cookie;
    nock("https://blahonga.expressen.se")
      .get("/")
      .reply(function blahongaReply() {
        const { headers } = this.req;
        cookie = headers.cookie;
        return [ 200, {} ];
      });

    await browser.window.fetch("https://blahonga.expressen.se/");
    expect(cookie).to.eql("_ga=1");
  });

  it("exposes pendingRequests promise list", async () => {
    let resolveFastRequest;
    const pendingFastResponse = new Promise((resolve) => {
      resolveFastRequest = resolve;
    });
    let resolveSlowRequest;
    const pendingSlowResponse = new Promise((resolve) => {
      resolveSlowRequest = resolve;
    });
    nock("https://blahonga.expressen.se")
      .get("/fast-request")
      .reply(async () => {
        await pendingFastResponse;
        return [ 200 ];
      })
      .get("/slow-request")
      .reply(async () => {
        await pendingSlowResponse;
        return [ 200 ];
      });

    const browser = await new Browser(app).navigateTo("/");
    expect(browser.window.fetch._pendingRequests.length).to.equal(0);

    browser.window.fetch("https://blahonga.expressen.se/fast-request");
    browser.window.fetch("https://blahonga.expressen.se/slow-request", { priority: "low" });
    browser.window.fetch("https://blahonga.expressen.se/error-request");

    const pendingRequests = browser.window.fetch._pendingRequests;
    expect(pendingRequests.length).to.equal(3);

    const done = [];
    const pendingAllDone = Promise.all(pendingRequests)
      .then(() => done.push("all"));
    const results = [];
    for (const pendingRequest of pendingRequests) {
      pendingRequest
        .then((r) => results.push(r));
    }

    resolveFastRequest();
    await pendingRequests[0];

    Promise.all(browser.window.fetch._pendingRequests)
      .then(() => done.push("all, mid process"));

    resolveSlowRequest();
    await pendingAllDone;

    expect(done).to.deep.equal([ "all", "all, mid process" ]);

    expect(results[0]).to.include.members([ "https://blahonga.expressen.se/error-request" ]);
    expect(results[0][0]).to.be.an.instanceof(Error);
    expect(results[1]).to.deep.equal([ null, "https://blahonga.expressen.se/fast-request" ]);
    expect(results[2]).to.include.members([ null, "https://blahonga.expressen.se/slow-request" ]);
    expect(results[2][2]).to.include({ priority: "low" });
  });

  describe("redirect", () => {
    let localApp;
    beforeEach(() => {
      localApp = express();

      localApp.get("/", (req, res) => {
        return res.send("<html></html>");
      });
    });

    [ 301, 302, 303 ].forEach((statusCode) => {
      it(`if local resource GET returns ${statusCode} by the redirect should be followed`, async () => {
        nock("https://www.example.com")
          .get("/")
          .reply(200, { data: 1 });

        localApp.use("/redirect", (req, res) => {
          return res.redirect(statusCode, "https://www.example.com");
        });

        const browser = await new Browser(localApp).navigateTo("/");
        const resp = await browser.window.fetch("/redirect").then((r) => r.json());

        expect(resp).to.eql({ data: 1 });
      });

      it(`if local resource POST returns ${statusCode} by the redirect should be followed using GET`, async () => {
        localApp.use("/redirect", (req, res) => {
          return res.redirect(statusCode, "https://www.example.com");
        });

        nock("https://www.example.com")
          .get("/")
          .reply(200, { data: 1 });

        const browser = await new Browser(localApp).navigateTo("/");
        const resp = await browser.window.fetch("/redirect", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ input: 1 }),
        }).then((r) => r.json());

        expect(resp).to.eql({ data: 1 });
      });

      it(`if remote resource GET returns ${statusCode} the redirect should be followed`, async () => {
        nock("https://www.example.com")
          .get("/redirect")
          .reply(statusCode, null, { location: "https://www.example.com/" })
          .get("/")
          .reply(200, { data: 1 });

        const browser = await new Browser(localApp).navigateTo("/");
        const resp = await browser.window.fetch("https://www.example.com/redirect").then((r) => r.json());

        expect(resp).to.eql({ data: 1 });
      });

      it(`if remote resource POST returns ${statusCode} the redirect should be followed using GET`, async () => {
        nock("https://www.example.com")
          .post("/redirect")
          .reply(statusCode, null, { location: "https://www.example.com/" })
          .get("/")
          .reply(200, { data: 1 });

        const browser = await new Browser(localApp).navigateTo("/");
        const resp = await browser.window.fetch("https://www.example.com/redirect", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ input: 1 }),
        }).then((r) => r.json());

        expect(resp).to.eql({ data: 1 });
      });

      it(`redirect with ${statusCode} gets cookies for domain`, async () => {
        localApp.use("/redirect", (req, res) => {
          return res.redirect(statusCode, "https://www.example.com");
        });

        const browser = await new Browser(localApp, {
          headers: {
            "X-Forwarded-Proto": "https",
            "X-Forwarded-Host": "www.expressen.se",
          },
        }).navigateTo("/", {
          cookie: "_ga=1",
          "set-cookie": "_ga=2; Domain=example.com",
        });

        let cookie;
        nock("https://www.example.com")
          .get("/")
          .reply(function blahongaReply() {
            const { headers } = this.req;
            cookie = headers.cookie;
            return [ 200, { cookie } ];
          });

        const resp = await browser.window.fetch("/redirect").then((r) => r.json());

        expect(resp).to.eql({ cookie: "_ga=2" });
      });
    });

    [ 307, 308 ].forEach((statusCode) => {
      it(`if local resource GET returns ${statusCode} by the redirect should be followed`, async () => {
        localApp.use("/redirect", (req, res) => {
          return res.redirect(statusCode, "https://www.example.com");
        });

        nock("https://www.example.com")
          .get("/")
          .reply(200, { data: 1 });

        const browser = await new Browser(localApp).navigateTo("/");
        const resp = await browser.window.fetch("/redirect").then((r) => r.json());

        expect(resp).to.eql({ data: 1 });
      });

      it(`if local resource POST returns ${statusCode} by the redirect should be followed with preserved verb and body`, async () => {
        localApp.use("/redirect", (req, res) => {
          return res.redirect(statusCode, "https://www.example.com");
        });

        nock("https://www.example.com")
          .post("/", { input: 1 })
          .matchHeader("content-type", "application/json")
          .reply(200, { data: 1 });

        const browser = await new Browser(localApp).navigateTo("/");
        const resp = await browser.window.fetch("/redirect", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ input: 1 }),
        }).then((r) => r.json());

        expect(resp).to.eql({ data: 1 });
      });

      it(`if remote resource GET returns ${statusCode} by the redirect should be followed`, async () => {
        localApp.use("/redirect", (req, res) => {
          return res.redirect(statusCode, "https://www.example.com");
        });

        nock("https://www.example.com")
          .get("/redirect")
          .reply(statusCode, null, { location: "https://www.example.com/" })
          .get("/")
          .reply(200, { data: 1 });

        const browser = await new Browser(localApp).navigateTo("/");
        const resp = await browser.window.fetch("https://www.example.com/redirect").then((r) => r.json());

        expect(resp).to.eql({ data: 1 });
      });

      it(`if remote resource POST returns ${statusCode} by the redirect should be followed with preserved verb and body`, async () => {
        localApp.use("/redirect", (req, res) => {
          return res.redirect(statusCode, "https://www.example.com");
        });

        nock("https://www.example.com")
          .post("/redirect", { input: 1 })
          .reply(statusCode, null, { location: "https://www.example.com/" })
          .post("/", { input: 1 })
          .matchHeader("content-type", "application/json")
          .reply(200, { data: 1 });

        const browser = await new Browser(localApp).navigateTo("/");
        const resp = await browser.window.fetch("/redirect", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ input: 1 }),
        }).then((r) => r.json());

        expect(resp).to.eql({ data: 1 });
      });
    });

    it("doesn't follow redirect from remote resource if follow is manual", async () => {
      nock("https://www.example.com")
        .get("/redirect")
        .reply(301, null, { location: "https://www.example.com/" });

      const browser = await new Browser(localApp).navigateTo("/");
      const resp = await browser.window.fetch("https://www.example.com/redirect", { redirect: "manual" });
      expect(resp.headers.get("location")).to.equal("https://www.example.com/");
    });

    it("doesn't follow redirect from local resource if follow is manual", async () => {
      localApp.use("/redirect", (req, res) => {
        return res.redirect(301, "https://www.example.com");
      });

      const browser = await new Browser(localApp).navigateTo("/");
      const resp = await browser.window.fetch("/redirect", { redirect: "manual" });
      expect(resp.headers.get("location")).to.equal("https://www.example.com");
    });

    it("redirect from remote resource to local resource is handled", async () => {
      localApp.use("/redirected", (req, res) => {
        return res.send({ data: 1 });
      });

      nock("https://www.example.com")
        .get("/redirect")
        .reply(301, null, { location: "https://www.expressen.se/redirected" });

      const browser = await new Browser(localApp).navigateTo("/", { host: "www.expressen.se" });

      const resp = await browser.window.fetch("https://www.example.com/redirect").then((r) => r.json());
      expect(resp).to.eql({ data: 1 });
    });
  });
});
