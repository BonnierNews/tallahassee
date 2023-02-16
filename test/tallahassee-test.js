"use strict";

const http = require("http");
const nock = require("nock");

const { app } = require("../app/app.js");
const Browser = require("../index.js");

const PORT = process.env.PORT;

describe("Tallahassee", () => {
  let server;
  before(() => {
    server = http.createServer(app);
    return new Promise((resolve) => {
      server.listen(0, resolve);
    });
  });
  after(() => {
    process.env.PORT = PORT;
    server.close();
  });

  it("origin as express app can navigate to url", async () => {
    const browser = await new Browser(app).navigateTo("/");
    expect(browser.window).to.be.ok;
  });

  it("origin as port can navigate to url", async () => {
    const browser = await new Browser(server.address().port).navigateTo("/");
    expect(browser.window).to.be.ok;
  });

  it("origin as string can navigate to url", async () => {
    const browser = await new Browser(`http://127.0.0.1:${server.address().port}`).navigateTo("/");
    expect(browser.window).to.be.ok;
  });

  it("defaults origin to process.env.PORT and can navigate to url", async () => {
    process.env.PORT = server.address().port;

    const browser = await new Browser().navigateTo("/");
    expect(browser.window).to.be.ok;
  });

  it("exposes response after navigation", async () => {
    const browser = await new Browser(server.address().port, { headers: { host: "www.expressen.se" } }).navigateTo("/setcookie");
    expect(browser.response).to.be.ok;
    expect(browser.response.status).to.equal(200);
    expect(browser.response.url).to.equal("http://www.expressen.se/setcookie");
    expect(browser.response.headers.raw()["set-cookie"]).to.have.length(2);
  });

  it("first navigation to external host is allowed", async () => {
    let externalHeaders;
    nock("https://login.expressen.se")
      .get("/")
      .reply(function reply() {
        externalHeaders = this.req.headers;
        return [ 302, null, {
          location: "https://www.expressen.se",
          "set-cookie": [
            "access=true; Domain=expressen.se; Path=/; Secure",
          ],
        } ];
      });

    const browser = await new Browser(app, {
      headers: {
        "x-forwarded-proto": "https",
        "x-forwarded-host": "www.expressen.se",
      },
    }).navigateTo("https://login.expressen.se");

    expect(browser.window.location.hostname).to.equal("www.expressen.se");
    expect(externalHeaders).to.not.have.property("x-forwarded-host");
  });
});
