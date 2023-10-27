"use strict";

const { Document } = require("../lib/index.js");

describe("HTMLTextAreaElement", () => {
  describe("innertText", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
        <html>
          <body>
            <form>
              <textarea name="novel"></textarea>
            </form>
          </body>
        </html>`,
      });
    });

    it("innerText is empty if value is set", () => {
      const elm = document.forms[0].elements.novel;
      elm.value = "a";
      expect(elm.textContent).to.equal("");
    });
  });

  describe("validation", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <form id="get-form" type="get" action="/">
                <textarea name="req" required></textarea>
                <textarea name="optional"></textarea>
                <button type="submit">Submit</button>
              </form>
            </body>
          </html>`,
      });
    });

    it("should not submit if form is not valid", () => {
      const form = document.forms[0];
      const button = document.getElementsByTagName("button")[0];

      let submitted = false;
      form.addEventListener("submit", () => {
        submitted = true;
      });

      button.click();
      expect(submitted).to.equal(false);

      form.elements.req.value = "test";
      button.click();
      expect(submitted).to.equal(true);
    });

    it("should get validity on form", () => {
      const form = document.forms[0];
      expect(form.reportValidity()).to.equal(false);

      form.elements.req.value = "test";
      expect(form.reportValidity()).to.equal(true);
    });

    it("should get validity on element", () => {
      const el = document.forms[0].elements.req;
      expect(el.reportValidity()).to.equal(false);

      el.value = "test";
      expect(el.reportValidity()).to.equal(true);
    });
  });

  describe("custom validity", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <form id="get-form" type="get" action="/">
                <textarea name="pets" id="pet-select" required oninvalid="setCustomValidity('Required')"></textarea>
                <input id="submit-form" type="submit">
              </form>
            </body>
          </html>`,
      });
    });

    it("setCustomValidity() without argument throws TypeError", () => {
      const form = document.forms[0];
      expect(() => form.elements.pets.setCustomValidity()).to.throw(TypeError, "Failed to execute 'setCustomValidity' on 'HTMLTextAreaElement': 1 argument required, but only 0 present.");
    });

    it("shows custom error message", () => {
      const form = document.forms[0];
      document.getElementById("submit-form").click();

      expect(form.elements.pets.validationMessage).to.equal("Required");
      expect(form.elements.pets.validity).to.have.property("customError", true);
    });

    it("checkValidity() returns true if required textarea is disabled", () => {
      const form = document.forms[0];
      form.elements.pets.disabled = true;
      expect(form.elements.pets.checkValidity()).to.equal(true);
    });

    it("disabled required input is ignored", () => {
      const form = document.forms[0];

      let submitted = false;
      document.addEventListener("submit", () => (submitted = true));

      form.elements.pets.disabled = true;
      document.getElementById("submit-form").click();
      expect(submitted).to.be.true;

      expect(form.elements.pets.validationMessage).to.equal("");
    });
  });
});
