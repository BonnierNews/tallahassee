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
              <p></p>
              <button></button>
              <fieldset></fieldset>
              <input name="foo">
              <input name="img" type="image">
              <object></object>
              <output></output>
              <select></select>
              <textarea></textarea>
              <div></div>
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

  it("elements list button, fieldset, input (not image), object, output, select, and textarea", () => {
    const form = document.forms[0];
    expect(form.elements.length).to.equal(7);
  });

  it("elements list is live", () => {
    const form = document.forms[0];
    expect(form.elements.length).to.equal(7);

    form.img.type = "text";

    expect(form.elements.length).to.equal(8);
  });

  it("toString includes class name", () => {
    expect(document.forms[0].toString()).to.equal("[object HTMLFormElement]");
  });
});
