import nock from "nock";

import { app } from "../app/app.js";
import Browser from "../index.js";

describe("submit", () => {
  let server, port;
  before(() => {
    server = app.listen();
    port = server.address().port;
  });
  after(() => {
    server.close();
  });

  it("submits get form on click with maintained headers", async () => {
    const browser = await new Browser(port).navigateTo("/", {
      host: "www.expressen.se",
      "x-forwarded-proto": "https",
      cookie: "_ga=2",
    });

    const form = browser.document.getElementById("get-form");
    const input = form.getElementsByTagName("input")[0];
    const button = form.getElementsByTagName("button")[0];

    input.name = "q";
    input.value = "12";

    button.click();

    expect(browser._pending).to.be.ok;

    const newNavigation = await browser._pending;

    expect(newNavigation.document.cookie).to.equal("_ga=2");
    expect(newNavigation.window.location).to.have.property("host", "www.expressen.se");
    expect(newNavigation.window.location).to.have.property("protocol", "https:");
    expect(newNavigation.window.location).to.have.property("search", "?q=12");
  });

  it("submits post form on click with maintained headers", async () => {
    const browser = await new Browser(port).navigateTo("/", {
      host: "www.expressen.se",
      "x-forwarded-proto": "https",
      cookie: "_ga=2",
      "content-type": "unknown/mime-type",
    });

    const form = browser.document.getElementById("post-form");
    const button = form.getElementsByTagName("button")[0];

    button.click();

    expect(browser._pending).to.be.ok;

    const newBrowser = await browser._pending;

    expect(newBrowser.document.body.innerHTML).to.contain("Post body");

    expect(newBrowser.document.cookie).to.equal("_ga=2");
    expect(newBrowser.window.location).to.have.property("host", "www.expressen.se");
    expect(newBrowser.window.location).to.have.property("protocol", "https:");
  });

  it("submits post form with payload on click", async () => {
    const browser = await new Browser(port).navigateTo("/");

    const form = browser.document.getElementById("post-form");
    const input = form.getElementsByTagName("input")[0];
    const button = form.getElementsByTagName("button")[0];

    input.name = "q";
    input.value = "12";

    button.click();

    expect(browser._pending).to.be.ok;

    const newBrowser = await browser._pending;

    expect(newBrowser.document.body.innerHTML).to.contain("{\"q\":\"12\",\"p\":\"text\"}");
  });

  it("submits post form without action to the same route on click", async () => {
    const browser = await new Browser(port).navigateTo("/?a=b");

    const form = browser.document.getElementById("post-form-without-action");
    const input = form.getElementsByTagName("input")[0];
    const button = form.getElementsByTagName("button")[0];

    input.name = "q";
    input.value = "12";

    button.click();

    expect(browser._pending).to.be.ok;

    const newBrowser = await browser._pending;

    expect(newBrowser.document.body.innerHTML).to.contain("{\"q\":\"12\"}");
    expect(newBrowser.window.location).to.have.property("search", "?a=b");
  });

  it("submits get form with values from checkboxes", async () => {
    const browser = await new Browser(port).navigateTo("/");

    const form = browser.document.getElementById("checkboxes-get-form");
    const button = form.getElementsByTagName("button")[0];

    button.click();

    expect(browser._pending).to.be.ok;

    const newNavigation = await browser._pending;
    expect(newNavigation.window.location).to.have.property("search", "?filter=cb1&filter=cb3");
  });

  it("submits post form with values from checkboxes", async () => {
    const browser = await new Browser(port).navigateTo("/");

    const form = browser.document.getElementById("checkboxes-post-form");
    const button = form.getElementsByTagName("button")[0];

    button.click();

    expect(browser._pending).to.be.ok;

    const newNavigation = await browser._pending;
    expect(newNavigation.document.body.innerHTML).to.contain("{\"filter\":[\"cb1\",\"cb3\"]}");
  });

  it("submits post form with values from select inputs", async () => {
    const browser = await new Browser(port).navigateTo("/");

    const form = browser.document.getElementById("select-form");
    const button = form.getElementsByTagName("button")[0];

    const selects = form.getElementsByTagName("select");
    const select = selects[0];
    const multipleSelect = selects[1];

    select.options[0].selected = true;
    multipleSelect.options[0].selected = true;
    multipleSelect.options[2].selected = true;

    button.click();

    expect(browser._pending).to.be.ok;

    const newNavigation = await browser._pending;
    expect(newNavigation.document.body.innerHTML).to.contain("{\"single-select\":\"1\",\"multiple-select\":[\"1\",\"3\"]}");
  });

  it("submits inner text if select input value is empty", async () => {
    const browser = await new Browser(port).navigateTo("/");

    const form = browser.document.getElementById("select-form");
    const button = form.getElementsByTagName("button")[0];

    const select = form.getElementsByTagName("select")[0];

    select.options[2].selected = true;

    button.click();

    expect(browser._pending).to.be.ok;

    const newNavigation = await browser._pending;
    expect(newNavigation.document.body.innerHTML).to.contain("{\"single-select\":\"value of 3\"}");
  });

  it("follows redirect on get", async () => {
    const browser = await new Browser(port).navigateTo("/");

    const form = browser.document.getElementById("get-form-redirect");
    const button = form.getElementsByTagName("button")[0];

    button.click();

    expect(browser._pending).to.be.ok;

    const newBrowser = await browser._pending;

    expect(newBrowser.window.location.pathname).to.equal("/req-info-html");
  });

  it("follows redirect on post", async () => {
    const browser = await new Browser(port).navigateTo("/");

    const form = browser.document.getElementById("post-form-redirect");
    const button = form.getElementsByTagName("button")[0];

    button.click();

    expect(browser._pending).to.be.ok;

    const newBrowser = await browser._pending;

    expect(newBrowser.window.location.pathname).to.equal("/req-info-html");
  });

  it("follows external redirect on post", async () => {
    nock("https://www.example.com")
      .get("/")
      .matchHeader("host", "www.example.com")
      .reply(200, "<html><body></body></html>", { "content-type": "text/html" });

    const browser = await new Browser(app, { headers: { host: "www.expressen.se" } }).navigateTo("/");

    const form = browser.document.getElementById("post-form-external-redirect");
    const button = form.getElementsByTagName("button")[0];

    button.click();

    expect(browser._pending).to.be.ok;

    const newBrowser = await browser._pending;

    expect(newBrowser.window.location.href).to.equal("https://www.example.com/");
  });

  it("follows external redirect on post that redirects back to app", async () => {
    const browser = await new Browser(app, { headers: { host: "www.expressen.se" } }).navigateTo("/");

    nock("https://www.example.com")
      .get("/")
      .reply(302, undefined, { location: browser.window.location.href });

    const form = browser.document.getElementById("post-form-external-redirect");
    const button = form.getElementsByTagName("button")[0];

    button.click();

    expect(browser._pending).to.be.ok;

    const newBrowser = await browser._pending;

    expect(newBrowser.window.location.host).to.equal("www.expressen.se");
    expect(newBrowser.window.location.pathname).to.equal("/");
  });

  it("follows external url on post", async () => {
    nock("https://www.example.com")
      .post("/blahonga/", "a=b")
      .matchHeader("host", "www.example.com")
      .reply(200, "<html><body></body></html>", { "content-type": "text/html" });

    const browser = await new Browser(app, { headers: { host: "www.expressen.se" } }).navigateTo("/");

    const form = browser.document.getElementById("post-form-external-direct");
    const button = form.getElementsByTagName("button")[0];

    button.click();

    expect(browser._pending).to.be.ok;

    const newBrowser = await browser._pending;

    expect(newBrowser.window.location.href).to.equal("https://www.example.com/blahonga/");
  });

  it("external site posts", async () => {
    nock("https://www.example.com")
      .post("/blahonga/", "a=b")
      .matchHeader("host", "www.example.com")
      .reply(200, "<html><body><form method='POST' action='http://www.expressen.se'><button type='submit'></button></form></body></html>", { "content-type": "text/html" });

    let browser = await new Browser(app, { headers: { host: "www.expressen.se" } }).navigateTo("/");

    const form = browser.document.getElementById("post-form-external-direct");
    const button = form.getElementsByTagName("button")[0];

    button.click();

    expect(browser._pending).to.be.ok;

    browser = await browser._pending;

    expect(browser.window.location.href).to.equal("https://www.example.com/blahonga/");

    const newButton = browser.document.getElementsByTagName("button")[0];

    newButton.click();

    browser = await browser._pending;

    expect(browser.window.location.href).to.equal("http://www.expressen.se/");
  });

  it("respects submit formaction", async () => {
    nock("https://www.example.com")
      .get("/")
      .matchHeader("host", "www.example.com")
      .reply(200, "<html><body><form method='POST' action='http://www.expressen.se'><button type='submit'></button></form></body></html>", { "content-type": "text/html" });

    let browser = await new Browser(app, { headers: { host: "www.expressen.se" } }).navigateTo("/");

    const form = browser.document.getElementById("multi-submit-form");
    const button = form.getElementsByTagName("button")[1];

    button.click();

    browser = await browser._pending;

    expect(browser.window.location.href).to.equal("https://www.example.com/");
  });

  it("named submit element appear in payload empty value", async () => {
    nock("https://www.example.com")
      .post("/1", (body) => {
        expect(body).to.have.property("named-button").that.is.empty;
        return true;
      })
      .matchHeader("host", "www.example.com")
      .reply(200, "<html><body><form method='POST' action='http://www.expressen.se'><button type='submit'></button></form></body></html>", { "content-type": "text/html" });

    let browser = await new Browser(app, { headers: { host: "www.expressen.se" } }).navigateTo("/");

    const form = browser.document.getElementById("multi-submit-form");
    const button = form.getElementsByTagName("button")[2];

    button.click();

    browser = await browser._pending;

    expect(browser.window.location.href).to.equal("https://www.example.com/1");
  });

  it("named submit element with value send payload with value", async () => {
    nock("https://www.example.com")
      .post("/2", (body) => {
        expect(body).to.have.property("named-button-with-value").that.equal("1");
        return true;
      })
      .matchHeader("host", "www.example.com")
      .reply(200, "<html><body><form method='POST' action='http://www.expressen.se'><button type='submit'></button></form></body></html>", { "content-type": "text/html" });

    let browser = await new Browser(app, { headers: { host: "www.expressen.se" } }).navigateTo("/");

    const form = browser.document.getElementById("multi-submit-form");
    const button = form.getElementsByTagName("button")[3];

    button.click();

    browser = await browser._pending;

    expect(browser.window.location.href).to.equal("https://www.example.com/2");
  });

  it("submits to local app if absolute form action matches host header", async () => {
    let browser = await new Browser(app, { headers: { host: "www.expressen.se" } }).navigateTo("/");

    const form = browser.document.getElementById("post-form-absolute-url");
    const button = form.getElementsByTagName("button")[0];

    button.click();

    expect(browser._pending).to.be.ok;

    browser = await browser._pending;

    expect(browser.window.location.href).to.equal("http://www.expressen.se/");
  });

  it("submits to local app if absolute form action matches x-forwarded-host header", async () => {
    let browser = await new Browser(app, {
      headers: {
        host: "some-other-host.com",
        "x-forwarded-host": "www.expressen.se",
      },
    }).navigateTo("/");

    const form = browser.document.getElementById("post-form-absolute-url");
    const button = form.getElementsByTagName("button")[0];

    button.click();

    expect(browser._pending).to.be.ok;

    browser = await browser._pending;

    expect(browser.window.location.href).to.equal("http://www.expressen.se/");
  });

  it("form.submit() emits no submit event", async () => {
    const browser = await new Browser(port).navigateTo("/");

    const form = browser.document.getElementById("post-form");

    let submitEvent = false;
    browser.document.addEventListener("submit", () => (submitEvent = true));

    form.submit();

    expect(browser._pending).to.be.ok;

    await browser._pending;

    expect(submitEvent).to.be.false;
  });

  it("submits input as array if more than 1 input with same name", async () => {
    const browser = await new Browser(port).navigateTo("/");

    const form = browser.document.getElementById("post-form-same-name");
    const button = form.getElementsByTagName("button")[0];

    button.click();

    expect(browser._pending).to.be.ok;

    const newNavigation = await browser._pending;

    const body = JSON.stringify({ test: [ "1", "2", "3" ], c: "d" });
    expect(newNavigation.document.body.innerHTML).to.contain(body);
  });

  it("supports submitting form by clicking on elements outside the form with form attribute", async () => {
    const browser = await new Browser(app, { headers: { host: "www.expressen.se" } }).navigateTo("/");

    let submitEvents = 0;
    browser.document.addEventListener("submit", () => submitEvents++);
    const button = browser.document.getElementById("outside-form-button");

    button.click();

    expect(browser._pending).to.be.ok;
    expect(submitEvents).to.eql(1);
  });

  it("preventing default on buttons with form attribute", async () => {
    const browser = await new Browser(app, { headers: { host: "www.expressen.se" } }).navigateTo("/");

    const button = browser.document.getElementById("outside-form-button");
    button.addEventListener("click", (e) => {
      e.preventDefault();
    });
    let submitEvent = false;
    browser.document.addEventListener("submit", () => (submitEvent = true));
    button.click();

    expect(browser._pending).to.not.be.ok;
    expect(submitEvent).to.be.false;
  });
});
