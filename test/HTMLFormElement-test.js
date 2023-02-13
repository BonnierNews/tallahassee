import {Document} from "../lib/index.js";

describe("HTMLFormElement", () => {
  describe("form elements", () => {
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
      expect(form.elements.foo.tagName).to.equal("INPUT");
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

      form.elements.img.type = "text";

      expect(form.elements.length).to.equal(8);
    });

    it("toString includes class name", () => {
      expect(document.forms[0].toString()).to.equal("[object HTMLFormElement]");
    });
  });

  describe("constraint validation", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <form>
                <input name="foo" required>
                <button type="submit">OK</button>
              </form>
              <form novalidate>
                <input name="foo" required>
                <button type="submit">OK</button>
              </form>
            </body>
          </html>`
      });
    });

    it("set/unset noValidate true alters DOM", () => {
      const form = document.forms[0];
      form.noValidate = true;
      expect(form.getAttribute("novalidate")).to.be.ok;

      form.noValidate = false;
      expect(form.getAttribute("novalidate")).to.not.be.ok;
    });

    it("get noValidate returns Boolean", () => {
      const form = document.forms[1];
      expect(form.noValidate).to.be.true;

      form.noValidate = false;
      expect(form.noValidate).to.be.false;
    });

    it("reportValidity() returns false if input fails to meet constraint", () => {
      const form = document.forms[0];
      expect(form.reportValidity()).to.be.false;
    });

    it("reportValidity() returns false if form is novalidate", () => {
      const form = document.forms[1];
      expect(form.reportValidity()).to.be.false;
    });

    it("form submit is prevented if constraints are unmet", () => {
      const form = document.forms[0];
      let submitted = false;
      form.addEventListener("submit", () => {
        submitted = true;
      });

      form.elements[1].click();
      expect(submitted).to.equal(false);
    });

    it("novalidate form submits ignoring validation", () => {
      const form = document.forms[1];
      let submitted = false;
      form.addEventListener("submit", () => {
        submitted = true;
      });

      form.elements[1].click();
      expect(submitted).to.equal(true);
    });
  });
});
