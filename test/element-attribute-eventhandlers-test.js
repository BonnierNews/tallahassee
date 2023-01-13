"use strict";

const Browser = require("../");

describe("element attribute eventhandler", () => {
  let browser;
  beforeEach(async () => {
    browser = await new Browser().load(`
      <html>
        <body>
          <form>
            <input name="foo" required oninvalid="window.invalidForm = true" oninput="document.getElementsByName('btn')[0].innerText = 'Save changes'">
            <input name="bar" minlength="2" oninvalid="classList.add('error')">
            <button name="btn">Button</button>
          </form>
        </body>
      </html>
    `);
  });

  it("has access to window", () => {
    const form = browser.document.forms[0];
    form.btn.click();

    expect(browser.window.invalidForm).to.be.true;
  });

  it("has access to document", () => {
    const form = browser.document.forms[0];
    form.foo.value = "abc";

    expect(form.btn.textContent).to.equal("Save changes");
  });

  it("has access to element", () => {
    const form = browser.document.forms[0];
    form.foo.value = "abc";
    form.bar.value = "a";
    form.btn.click();

    expect(form.bar.classList.contains("error")).to.be.true;
  });
});
