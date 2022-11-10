"use strict";

const {Document} = require("../lib");

describe("HTMLInputElement", () => {
  describe("validation", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <form id="get-form" type="get" action="/">
                <input type="text" name="optional">
                <input type="number" name="size" min="4" max="5">
                <input type="text" name="pattern" pattern="[a-z]{4,8}">
                <input type="text" name="req" required>
                <input type="text" name="reqsize" required minlength="4" maxlength="5">
                <input type="email" name="mailme">
                <input type="number" name="step" step="2">
                <button type="submit">Submit</button>
              </form>
            </body>
          </html>`
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

      form.req.value = "test";
      form.reqsize.value = "test";
      button.click();
      expect(submitted).to.equal(true);
    });

    it("should get validity on form", () => {
      const form = document.forms[0];
      expect(form.reportValidity()).to.equal(false);

      form.req.value = "test";
      expect(form.reportValidity()).to.equal(false);

      form.reqsize.value = "test";
      expect(form.reportValidity()).to.equal(true);
    });

    it("should get validity on element", () => {
      const el = document.forms[0].req;
      expect(el.reportValidity()).to.equal(false);

      el.value = "test";
      expect(el.reportValidity()).to.equal(true);
    });

    it("should get validity on optional element with min and max", () => {
      const el = document.forms[0].size;
      expect(el.reportValidity()).to.equal(true);

      el.value = 10;
      expect(el.reportValidity()).to.equal(false);

      el.value = 1;
      expect(el.reportValidity()).to.equal(false);

      el.value = 4;
      expect(el.reportValidity()).to.equal(true);

      el.value = 5;
      expect(el.reportValidity()).to.equal(true);
    });

    it("should get validity on number element with step", () => {
      const el = document.forms[0].step;
      expect(el.reportValidity()).to.equal(true);

      el.value = 10;
      expect(el.reportValidity()).to.equal(true);

      el.value = 1;
      expect(el.reportValidity()).to.equal(false);

      el.value = 4;
      expect(el.reportValidity()).to.equal(true);

      el.value = 5;
      expect(el.reportValidity()).to.equal(false);
    });

    it("should get validity on optional element with pattern", () => {
      const el = document.forms[0].pattern;
      expect(el.reportValidity()).to.equal(true);

      el.value = "foo";
      expect(el.reportValidity()).to.equal(false);

      el.value = "foobarbaz";
      expect(el.reportValidity()).to.equal(false);

      el.value = "foobar";
      expect(el.reportValidity()).to.equal(true);
    });

    it("element should fire 'invalid' event for all elements if validation fails", () => {
      const {req, reqsize} = document.forms[0];
      const button = document.getElementsByTagName("button")[0];

      let reqFired = 0;
      let reqsizeFired = 0;
      req.addEventListener("invalid", () => reqFired++);
      reqsize.addEventListener("invalid", () => reqsizeFired++);

      req.value = "test";
      reqsize.value = "test";
      button.click();

      expect(reqFired).to.equal(0);
      expect(reqsizeFired).to.equal(0);

      req.value = "";
      reqsize.value = "";
      button.click();

      expect(reqFired).to.equal(1);
      expect(reqsizeFired).to.equal(1);
    });

    it("type email reports type mismatch if no @ in value", () => {
      const form = document.forms[0];
      const validity = form.mailme.validity;

      expect(validity).to.have.property("typeMismatch", false);
      expect(validity).to.have.property("valid", true);

      form.mailme.value = "bar";

      expect(validity).to.have.property("typeMismatch", true);
      expect(validity).to.have.property("valid", false);

      form.mailme.value = "foo@bar";

      expect(validity).to.have.property("typeMismatch", false);
      expect(validity).to.have.property("valid", true);
    });

    it("required type email reports type mismatch if no @ in value", () => {
      const form = document.forms[0];
      form.mailme.required = true;
      const validity = form.mailme.validity;

      expect(validity).to.have.property("valueMissing", true);
      expect(validity).to.have.property("typeMismatch", false);
      expect(validity).to.have.property("valid", false);

      form.mailme.value = "bar";

      expect(validity).to.have.property("valueMissing", false);
      expect(validity).to.have.property("typeMismatch", true);
      expect(validity).to.have.property("valid", false);

      form.mailme.value = "foo@bar";

      expect(validity).to.have.property("valueMissing", false);
      expect(validity).to.have.property("typeMismatch", false);
      expect(validity).to.have.property("valid", true);
    });

    it("minlength and maxlength triggers validation", () => {
      const form = document.forms[0];
      const input = form.reqsize;
      const validity = input.validity;

      expect(validity).to.have.property("valueMissing", true);
      expect(validity).to.have.property("tooShort", false);
      expect(validity).to.have.property("tooLong", false);

      input.required = false;
      expect(validity).to.have.property("valueMissing", false);
      expect(validity).to.have.property("tooShort", false);
      expect(validity).to.have.property("tooLong", false);

      input.value = "bar";

      expect(validity).to.have.property("valueMissing", false);
      expect(validity).to.have.property("tooShort", true);
      expect(validity).to.have.property("tooLong", false);

      input.value = "barbaz";

      expect(validity).to.have.property("valueMissing", false);
      expect(validity).to.have.property("tooShort", false);
      expect(validity).to.have.property("tooLong", true);
    });

    it("type mail requires x@y", () => {
      const form = document.forms[0];
      const input = form.mailme;
      const validity = input.validity;

      input.required = true;
      expect(validity, "required").to.have.property("valueMissing", true);
      expect(validity, "required typeMismatch").to.have.property("typeMismatch", false);

      input.required = false;
      expect(validity, "optional").to.have.property("valueMissing", false);
      expect(validity, "optional typeMismatch").to.have.property("typeMismatch", false);

      input.value = "x@y";

      expect(validity, input.value).to.have.property("valueMissing", false);
      expect(validity, input.value).to.have.property("typeMismatch", false);

      input.value = "x@y@z";

      expect(validity, input.value).to.have.property("valueMissing", false);
      expect(validity, input.value).to.have.property("typeMismatch", true);

      input.value = "xy";

      expect(validity, input.value).to.have.property("valueMissing", false);
      expect(validity, input.value).to.have.property("typeMismatch", true);

      input.value = "jan.bananberg@expressen.se";

      expect(validity, input.value).to.have.property("valueMissing", false);
      expect(validity, input.value).to.have.property("typeMismatch", false);

      input.value = "jan.bananberg@expressen.se\n";

      expect(validity, input.value).to.have.property("valueMissing", false);
      expect(validity, input.value).to.have.property("typeMismatch", true);

      input.value = "\r\njan.bananberg@expressen.se";

      expect(validity, input.value).to.have.property("valueMissing", false);
      expect(validity, input.value).to.have.property("typeMismatch", true);
    });
  });

  describe("custom validation", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <form id="custom">
                <input name="foo" required oninput="setCustomValidity('')" oninvalid="setCustomValidity('Required')">
                <input id="submit-form" type="submit">
              </form>
              <form id="typeMismatch">
                <input name="foo" type="email" required oninput="setCustomValidity('')">
                <input id="submit-form" type="submit">
              </form>
            </body>
          </html>`
      });
    });

    it("setCustomValidity() without argument throws TypeError", () => {
      const form = document.forms[0];
      expect(() => form.foo.setCustomValidity()).to.throw(TypeError, "Failed to execute 'setCustomValidity' on 'HTMLInputElement': 1 argument required, but only 0 present.");
    });

    it("setCustomValidity(null) sets 'null'", () => {
      const form = document.forms[0];
      form.foo.setCustomValidity(null);
      expect(form.foo.validationMessage).to.equal("null");
    });

    it("setCustomValidity(undefined) sets 'undefined'", () => {
      const form = document.forms[0];
      form.foo.setCustomValidity(undefined);
      expect(form.foo.validationMessage).to.equal("undefined");
    });

    it("checkValidity() returns false if required input is empty", () => {
      const form = document.forms[0];
      expect(form.foo.checkValidity()).to.equal(false);
    });

    it("checkValidity() returns true if required input is disabled", () => {
      const form = document.forms[0];
      form.foo.disabled = true;
      expect(form.foo.checkValidity()).to.equal(true);
    });

    it("disabled required input is ignored", () => {
      const form = document.forms[0];

      let submitted = false;
      document.addEventListener("submit", () => submitted = true);

      form.foo.disabled = true;
      document.getElementById("submit-form").click();
      expect(submitted).to.be.true;

      expect(form.foo.validationMessage).to.equal("");
    });

    it("form submit is prevented if input is required", () => {
      const form = document.forms[0];

      let submitted = false;
      document.addEventListener("submit", () => submitted = true);

      document.getElementById("submit-form").click();
      expect(form.foo.validationMessage).to.equal("Required");
      expect(form.foo.validity).to.have.property("customError", true);

      expect(submitted).to.be.false;
    });

    it("oninput declaration can reset validation message", () => {
      const form = document.forms[0];

      let submitted = false;
      document.addEventListener("submit", () => submitted = true);

      document.getElementById("submit-form").click();
      expect(form.foo.validationMessage).to.equal("Required");

      expect(submitted).to.be.false;

      form.foo.value = "a";

      expect(form.foo.validationMessage).to.equal("");

      document.getElementById("submit-form").click();

      expect(submitted).to.be.true;
    });
  });

  describe("element attribute event handler", () => {
    it("syntax error in attribute event handler throws", () => {
      const doc = new Document({
        text: `
          <html>
            <body>
              <form id="custom">
                <input name="foo" required oninvalid="setCustomValidity('Required'">
                <input id="submit-form" type="submit">
              </form>
            </body>
          </html>`
      });

      expect(() => {
        doc.getElementById("submit-form").click();
      }).to.throw(SyntaxError);
    });

    it("undefined function in attribute event handler throws", () => {
      const doc = new Document({
        text: `
          <html>
            <body>
              <form id="custom">
                <input name="foo" required oninvalid="setcustomvalidity('Required')">
                <input id="submit-form" type="submit">
              </form>
            </body>
          </html>`
      });

      expect(() => {
        doc.getElementById("submit-form").click();
      }).to.throw(ReferenceError);
    });
  });
});
