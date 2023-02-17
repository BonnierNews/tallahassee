"use strict";

const { app } = require("../app/app.js");
const Browser = require("../index.js");

describe("Custom elements", () => {
  let browser;
  before(() => {
    browser = new Browser(app, { matchMedia: /.*/, console });
  });

  it("window.customElements.define adds custom element behavior", async () => {
    const page = await browser.navigateTo("/custom-element.html");
    page.window.styleMedia = { type: "only all" };
    page.runScripts();

    expect(page.window.customElements.get("waiting-button")).to.be.a("function");

    const elm = page.document.getElementsByTagName("waiting-button")[0];
    expect(elm.getAttribute("style")).to.equal("--spinner-delay: 100;");

    const button = page.document.getElementById("clickme");
    button.click();
    expect(button.classList.contains("btn--waiting"), "click btn--waiting class").to.be.true;
  });

  it("window.customElements.define throws if same name is added twice", async () => {
    const page = await browser.navigateTo("/custom-element.html");
    page.window.customElements.define("me-button", class Me {});
    expect(() => {
      page.window.customElements.define("me-button", class Me {});
    }).to.throw();
  });
});
