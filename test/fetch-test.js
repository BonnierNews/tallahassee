"use strict";

const app = require("../app/app");
const Browser = require("../");
const Fetch = require("../lib/Fetch");
const express = require("express");
const nock = require("nock");
const supertest = require("supertest");

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

  it("external post is supported", async () => {
    const browser = await Browser(app).navigateTo("/");

    const json = JSON.stringify({ foo: "bar" });
    nock("http://example.com")
      .post("/", json)
      .reply(200, {data: 1});

    const body = await browser.window.fetch("http://example.com/", {
      method: "POST",
      body: json
    }).then((res) => res.json());
    expect(body).to.eql({data: 1});
  });

  it("local post is supported", async () => {
    const browser = await Browser(app).navigateTo("/");

    const json = JSON.stringify({ foo: "bar" });

    const body = await browser.window.fetch("/post", {
      method: "POST",
      body: json
    }).then((res) => res.json());
    expect(body).to.eql({data: 1});
  });

  it("local head is supported", async () => {
    const browser = await Browser(app).navigateTo("/");
    const status = await browser.window.fetch("/head", {
      method: "HEAD"
    }).then((res) => res.status);
    expect(status).to.eql(418);
  });

  it("local resource routes to app", async () => {
    const browser = await Browser(app).navigateTo("/");

    const body = await browser.window.fetch("/api").then((res) => res.json());
    expect(body).to.eql({data: 1});
  });

  it("local resource routes to app if host match", async () => {
    const browser = await Browser(app).navigateTo("/", {host: "www.expressen.se", "x-forwarded-proto": "https"});

    const body = await browser.window.fetch("https://www.expressen.se/api").then((res) => res.json());

    expect(body).to.eql({data: 1});
  });

  it("local resource routes to app if x-forwarded-host match", async () => {
    const browser = await Browser(app).navigateTo("/", {host: "some-other-host.com", "x-forwarded-host": "www.expressen.se", "x-forwarded-proto": "https"});

    const body = await browser.window.fetch("https://www.expressen.se/api").then((res) => res.json());

    expect(body).to.eql({data: 1});
  });

  it("passes cookie to local resource", async () => {
    const browser = await Browser(app).navigateTo("/", {
      cookie: "_ga=1"
    });

    const body = await browser.window.fetch("/req").then((res) => res.json());
    expect(body).to.have.property("cookie", "_ga=1");
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
    });

    nock("http://example.com")
      .get("/with-header")
      .reply(function () {
        const {headers} = this.req;
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

  it("resolves to object with ok property set to true when successfull external request", async () => {
    const browser = await Browser(app).navigateTo("/");

    nock("http://example.com")
      .get("/")
      .reply(200, {data: 1});

    const response = await browser.window.fetch("http://example.com/");
    expect(response).to.have.property("ok", true);
  });

  it("resolves to object with ok property set to false when response is 404 to external request", async () => {
    const browser = await Browser(app).navigateTo("/");

    nock("http://example.com")
      .get("/")
      .reply(404, {});

    const response = await browser.window.fetch("http://example.com/");
    expect(response).to.have.property("ok", false);
  });

  it("resolves to object with ok property set to false when response is 500 to external request", async () => {
    const browser = await Browser(app).navigateTo("/");

    nock("http://example.com")
      .get("/")
      .reply(500, {});

    const response = await browser.window.fetch("http://example.com/");
    expect(response).to.have.property("ok", false);
  });

  it("resolves to object with ok property set to true when successfull local request", async () => {
    const browser = await Browser(app).navigateTo("/");

    const response = await browser.window.fetch("/req");
    expect(response).to.have.property("ok", true);
  });

  it("resolves to object with ok property set to false when response is 404 to local request", async () => {
    const browser = await Browser(app).navigateTo("/");

    const response = await browser.window.fetch("/404");
    expect(response).to.have.property("ok", false);
  });

  it("resolves to object with ok property set to false when response is 500 to local request", async () => {
    const browser = await Browser(app).navigateTo("/");

    const response = await browser.window.fetch("/err");
    expect(response).to.have.property("ok", false);
  });

  it("local resource res.text returns promise", async () => {
    const browser = await Browser(app).navigateTo("/");

    const res = await browser.window.fetch("/partial.html");
    expect(res.text()).to.be.a("promise");
  });

  it("local resource res.json returns promise", async () => {
    const browser = await Browser(app).navigateTo("/");

    const res = await browser.window.fetch("/api");
    expect(res.json()).to.be.a("promise");
  });

  it("should attach cookies from req header to exactly the app host", async () => {
    const browser = await Browser(app, {
      headers: {
        "X-Forwarded-Proto": "https",
        "X-Forwarded-Host": "www.expressen.se"
      }
    }).navigateTo("/", { cookie: "_ga=1" });

    let cookie;
    nock("https://blahonga.expressen.se")
      .get("/").reply(function () {
        const {headers} = this.req;
        cookie = headers.cookie;
        return [200, {}];
      });

    await browser.window.fetch("https://blahonga.expressen.se/");
    expect(cookie).to.equal(undefined);
  });

  it("should use cookie jar when making external fetch requests", async () => {
    let browser = Browser(app, {
      headers: {
        "X-Forwarded-Proto": "https",
        "X-Forwarded-Host": "www.expressen.se"
      }
    });
    browser.jar.setCookies("_ga=1; Domain=.expressen.se; Path=/;Secure");

    browser = await browser.navigateTo("/");

    let cookie;
    nock("https://blahonga.expressen.se")
      .get("/").reply(function () {
        const {headers} = this.req;
        cookie = headers.cookie;
        return [200, {}];
      });

    await browser.window.fetch("https://blahonga.expressen.se/");
    expect(cookie).to.eql(["_ga=1"]);
  });

  describe("redirect", () => {
    [301, 302, 303].forEach((statusCode) => {
      it(`if local resource GET returns ${statusCode} by the redirect should be followed`, async () => {
        const localApp = express();

        localApp.use("/", (req, res) => {
          return res.redirect(statusCode, "https://www.example.com");
        });

        nock("https://www.example.com")
          .get("/")
          .reply(200, { data: 1 });

        const agent = supertest.agent(localApp);

        const fetch = Fetch(agent, {});

        const resp = await fetch("/").then((r) => r.json());

        expect(resp).to.eql({ data: 1 });
      });

      it(`if local resource POST returns ${statusCode} by the redirect should be followed using GET`, async () => {
        const localApp = express();

        localApp.use("/", (req, res) => {
          return res.redirect(statusCode, "https://www.example.com");
        });

        nock("https://www.example.com")
          .get("/")
          .reply(200, { data: 1 });

        const agent = supertest.agent(localApp);

        const fetch = Fetch(agent, {});

        const resp = await fetch("/", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({ input: 1 }),
        }).then((r) => r.json());

        expect(resp).to.eql({ data: 1 });
      });

      it(`if remote resource GET returns ${statusCode} the redirect should be followed`, async () => {
        const localApp = express();

        nock("https://www.example.com")
          .get("/redirect")
          .reply(statusCode, null, { location: "https://www.example.com/" })
          .get("/")
          .reply(200, { data: 1 });

        const agent = supertest.agent(localApp);

        const fetch = Fetch(agent, {});

        const resp = await fetch("https://www.example.com/redirect").then((r) => r.json());

        expect(resp).to.eql({ data: 1 });
      });

      it(`if remote resource POST returns ${statusCode} the redirect should be followed using GET`, async () => {
        const localApp = express();

        nock("https://www.example.com")
          .post("/redirect")
          .reply(statusCode, null, { location: "https://www.example.com/" })
          .get("/")
          .reply(200, { data: 1 });

        const agent = supertest.agent(localApp);

        const fetch = Fetch(agent, {});

        const resp = await fetch("https://www.example.com/redirect", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({ input: 1 }),
        }).then((r) => r.json());

        expect(resp).to.eql({ data: 1 });
      });
    });

    [307, 308].forEach((statusCode) => {
      it(`if local resource GET returns ${statusCode} by the redirect should be followed`, async () => {
        const localApp = express();

        localApp.use("/", (req, res) => {
          return res.redirect(statusCode, "https://www.example.com");
        });

        nock("https://www.example.com")
          .get("/")
          .reply(200, { data: 1 });

        const agent = supertest.agent(localApp);

        const fetch = Fetch(agent, {});

        const resp = await fetch("/").then((r) => r.json());

        expect(resp).to.eql({ data: 1 });
      });

      it(`if local resource POST returns ${statusCode} by the redirect should be followed with preserved verb and body`, async () => {
        const localApp = express();

        localApp.use("/", (req, res) => {
          return res.redirect(statusCode, "https://www.example.com");
        });

        nock("https://www.example.com")
          .post("/", { input: 1 })
          .matchHeader("content-type", "application/json")
          .reply(200, { data: 1 });

        const agent = supertest.agent(localApp);

        const fetch = Fetch(agent, {});

        const resp = await fetch("/", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({ input: 1 }),
        }).then((r) => r.json());

        expect(resp).to.eql({ data: 1 });
      });

      it(`if remote resource GET returns ${statusCode} by the redirect should be followed`, async () => {
        const localApp = express();

        localApp.use("/", (req, res) => {
          return res.redirect(statusCode, "https://www.example.com");
        });

        nock("https://www.example.com")
          .get("/redirect")
          .reply(statusCode, null, { location: "https://www.example.com/" })
          .get("/")
          .reply(200, { data: 1 });

        const agent = supertest.agent(localApp);

        const fetch = Fetch(agent, {});

        const resp = await fetch("https://www.example.com/redirect").then((r) => r.json());

        expect(resp).to.eql({ data: 1 });
      });

      it(`if remote resource POST returns ${statusCode} by the redirect should be followed with preserved verb and body`, async () => {
        const localApp = express();

        localApp.use("/", (req, res) => {
          return res.redirect(statusCode, "https://www.example.com");
        });

        nock("https://www.example.com")
          .post("/redirect", { input: 1 })
          .reply(statusCode, null, { location: "https://www.example.com/" })
          .post("/", { input: 1 })
          .matchHeader("content-type", "application/json")
          .reply(200, { data: 1 });

        const agent = supertest.agent(localApp);

        const fetch = Fetch(agent, {});

        const resp = await fetch("/", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({ input: 1 }),
        }).then((r) => r.json());

        expect(resp).to.eql({ data: 1 });
      });
    });

    it("doesn't follow redirect from remote resource if follow is manual", async () => {
      const localApp = express();
      const agent = supertest.agent(localApp);

      nock("https://www.example.com")
        .get("/redirect")
        .reply(301, null, { location: "https://www.example.com/" });

      const fetch = Fetch(agent, {});

      const resp = await fetch("https://www.example.com/redirect", {redirect: "manual"});
      expect(resp.headers.get("location")).to.equal("https://www.example.com/");
    });

    it("doesn't follow redirect from local resource if follow is manual", async () => {
      const localApp = express();

      localApp.use("/", (req, res) => {
        return res.redirect(301, "https://www.example.com");
      });

      const agent = supertest.agent(localApp);

      const fetch = Fetch(agent, {});

      const resp = await fetch("/", {redirect: "manual"});
      expect(resp.headers.get("location")).to.equal("https://www.example.com");
    });

    it("redirect from remote resource to local resource is handled", async () => {
      const localApp = express();

      nock("https://www.example.com")
        .get("/redirect")
        .reply(301, null, { location: "https://www.expressen.se/" });

      localApp.use("/", (req, res) => {
        return res.send({data: 1});
      });

      const agent = supertest.agent(localApp);

      const fetch = Fetch(agent, {
        request: {
          header: {
            host: "www.expressen.se"
          }
        }
      });

      const resp = await fetch("https://www.example.com/redirect").then((r) => r.json());

      expect(resp).to.eql({data: 1});
    });
  });
});
