"use strict";

const Browser = require("../");
const app = require("../app/app");

describe("element attribute eventhandler", () => {
  let browser;
  beforeEach(async () => {
    browser = await new Browser(app, {runScripts: true}).navigateTo("/inline-scripts");
  });

  it("has access to window", () => {
    const form = browser.document.forms[0];
    form.elements.btn.click();

    expect(browser.window.invalidForm).to.be.true;
  });

  it("has access to document", () => {
    const form = browser.document.forms[0];
    form.elements.foo.value = "abc";

    expect(form.elements.btn.textContent).to.equal("Save changes");
  });

  it("has access to element", () => {
    const form = browser.document.forms[0];
    form.elements.foo.value = "abc";
    form.elements.bar.value = "a";
    form.elements.btn.click();

    expect(form.elements.bar.classList.contains("error")).to.be.true;
  });
});
