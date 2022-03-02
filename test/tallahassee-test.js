"use strict";

const app = require("../app/app");
const Browser = require("../");
const http = require("http");

const PORT = process.env.PORT;

describe("Tallahassee", () => {
  let server;
  before(async () => {
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
    const browser = await Browser(app).navigateTo("/");
    expect(browser.window).to.be.ok;
  });

  it("origin as port can navigate to url", async () => {
    const browser = await Browser(server.address().port).navigateTo("/");
    expect(browser.window).to.be.ok;
  });

  it("origin as string can navigate to url", async () => {
    const browser = await Browser(`http://127.0.0.1:${server.address().port}`).navigateTo("/");
    expect(browser.window).to.be.ok;
  });

  it("defaults origin to process.env.PORT and can navigate to url", async () => {
    process.env.PORT = server.address().port;

    const browser = await Browser().navigateTo("/");
    expect(browser.window).to.be.ok;
  });
});