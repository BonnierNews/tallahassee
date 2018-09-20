"use strict";

const app = require("../app/app");
const Browser = require("../");
const nock = require("nock");
const {Compiler} = require("../lib/Compiler");

describe("window.fetch", () => {
  before(() => {
    Compiler([/assets\/scripts/]);
  });

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

  it("local resource routes to app", async () => {
    const browser = await Browser(app).navigateTo("/");

    const body = await browser.window.fetch("/api").then((res) => res.json());
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
});
