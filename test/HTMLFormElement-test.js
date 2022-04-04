"use strict";

const {Document} = require("../lib");

describe("HTMLFormElement", () => {
  let document;
  beforeEach(() => {
    document = new Document({
      text: `
        <html>
          <body>
            <form>
              <input name="foo">
            </form>
          </body>
        </html>`
    });
  });

  it("form input can be addressed by name", () => {
    const form = document.getElementsByTagName("form")[0];
    expect(form.foo.tagName).to.equal("INPUT");
  });

  it("form non-existing symbol property is falsy", () => {
    const form = document.getElementsByTagName("form")[0];
    expect(form[Symbol.for("chai/inspect")]).to.not.be.ok;
  });

  it("non-existing symbol property in form is false", () => {
    const form = document.getElementsByTagName("form")[0];
    expect(Symbol.for("chai/inspect") in form).to.be.false;
  });
});
