import {Document} from "../lib/index.js";

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
                <input type="url" name="uri">
                <input type="number" name="step" step="2">
                <input type="checkbox" name="agree" value="true">
                <label for="interests">Intressant</label>
                <input type="radio" name="interests" value="sports">
                <input type="radio" name="interests" value="food">
                <input type="hidden" name="hide" required>
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

      form.elements.req.value = "test";
      form.elements.reqsize.value = "test";
      button.click();
      expect(submitted).to.equal(true);
    });

    it("should get validity on form", () => {
      const form = document.forms[0];
      expect(form.reportValidity()).to.equal(false);

      form.elements.req.value = "test";
      expect(form.reportValidity()).to.equal(false);

      form.elements.reqsize.value = "test";
      expect(form.reportValidity()).to.equal(true);
    });

    it("should get validity on element", () => {
      const el = document.forms[0].elements.req;
      expect(el.reportValidity()).to.equal(false);

      el.value = "test";
      expect(el.reportValidity()).to.equal(true);
    });

    it("should get validity on optional element with min and max", () => {
      const el = document.forms[0].elements.size;
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
      const el = document.forms[0].elements.step;
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
      const el = document.forms[0].elements.pattern;
      expect(el.reportValidity()).to.equal(true);

      el.value = "foo";
      expect(el.reportValidity()).to.equal(false);

      el.value = "foobarbaz";
      expect(el.reportValidity()).to.equal(false);

      el.value = "foobar";
      expect(el.reportValidity()).to.equal(true);
    });

    it("element should fire 'invalid' event for all elements if validation fails", () => {
      const {req, reqsize} = document.forms[0].elements;
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
      const validity = form.elements.mailme.validity;

      expect(validity).to.have.property("typeMismatch", false);
      expect(validity).to.have.property("valid", true);

      form.elements.mailme.value = "bar";

      expect(validity).to.have.property("typeMismatch", true);
      expect(validity).to.have.property("valid", false);

      form.elements.mailme.value = "foo@bar";

      expect(validity).to.have.property("typeMismatch", false);
      expect(validity).to.have.property("valid", true);
    });

    it("required type email reports type mismatch if no @ in value", () => {
      const form = document.forms[0];
      form.elements.mailme.required = true;
      const validity = form.elements.mailme.validity;

      expect(validity).to.have.property("valueMissing", true);
      expect(validity).to.have.property("typeMismatch", false);
      expect(validity).to.have.property("valid", false);

      form.elements.mailme.value = "bar";

      expect(validity).to.have.property("valueMissing", false);
      expect(validity).to.have.property("typeMismatch", true);
      expect(validity).to.have.property("valid", false);

      form.elements.mailme.value = "foo@bar";

      expect(validity).to.have.property("valueMissing", false);
      expect(validity).to.have.property("typeMismatch", false);
      expect(validity).to.have.property("valid", true);
    });

    it("required type checkbox reports value missing if not checked", () => {
      const form = document.forms[0];
      form.elements.agree.required = true;
      const validity = form.elements.agree.validity;

      expect(validity).to.have.property("valueMissing", true);
      expect(validity).to.have.property("valid", false);

      form.elements.agree.click();

      expect(validity).to.have.property("valueMissing", false);
      expect(validity).to.have.property("valid", true);

      form.elements.agree.click();

      expect(validity).to.have.property("valueMissing", true);
      expect(validity).to.have.property("valid", false);
    });

    it("required type radio reports value missing if not checked", () => {
      const form = document.forms[0];
      const list = form.elements.interests;
      const validityOption0 = list[0].validity;
      const validityOption1 = list[1].validity;

      expect(validityOption0, "option 1 valueMissing").to.have.property("valueMissing", false);
      expect(validityOption0, "option 1 valid").to.have.property("valid", true);

      expect(validityOption1, "option 2 valueMissing").to.have.property("valueMissing", false);
      expect(validityOption1, "option 2 valid").to.have.property("valid", true);

      list[0].required = true;

      expect(validityOption0, "option 1 valueMissing").to.have.property("valueMissing", true);
      expect(validityOption1, "option 2 valueMissing").to.have.property("valueMissing", true);

      list[0].checked = true;

      expect(validityOption0, "option 1 valueMissing").to.have.property("valueMissing", false);
      expect(validityOption0, "option 1 valid").to.have.property("valid", true);
      expect(validityOption1, "option 2 valueMissing").to.have.property("valueMissing", false);
      expect(validityOption1, "option 2 valid").to.have.property("valid", true);

      list[0].checked = false;
      list[0].required = false;
      list[1].required = true;

      expect(validityOption0, "option 1 valueMissing").to.have.property("valueMissing", true);
      expect(validityOption1, "option 2 valueMissing").to.have.property("valueMissing", true);

      list[1].checked = true;

      expect(validityOption0, "option 1 valid").to.have.property("valid", true);
      expect(validityOption1, "option 2 valid").to.have.property("valid", true);
    });

    it("minlength and maxlength triggers validation", () => {
      const form = document.forms[0];
      const input = form.elements.reqsize;
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
      const input = form.elements.mailme;
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

    it("type url requires URL", () => {
      const form = document.forms[0];
      const input = form.elements.uri;
      const validity = input.validity;

      input.required = true;
      expect(validity, "required").to.have.property("valueMissing", true);
      expect(validity, "required typeMismatch").to.have.property("typeMismatch", false);

      input.required = false;
      expect(validity, "optional").to.have.property("valueMissing", false);
      expect(validity, "optional typeMismatch").to.have.property("typeMismatch", false);

      input.value = "http://me";

      expect(validity, input.value).to.have.property("valueMissing", false);
      expect(validity, input.value).to.have.property("typeMismatch", false);

      input.value = "x@y@z";

      expect(validity, input.value).to.have.property("valueMissing", false);
      expect(validity, input.value).to.have.property("typeMismatch", true);

      input.value = "xy";

      expect(validity, input.value).to.have.property("valueMissing", false);
      expect(validity, input.value).to.have.property("typeMismatch", true);

      input.value = "https://expressen.se";

      expect(validity, input.value).to.have.property("typeMismatch", false);
    });

    describe("willValidate", () => {
      it("returns false if hidden, readOnly, or disabled", () => {
        const form = document.forms[0];
        form.elements.size.readOnly = true;
        expect(form.elements.size).to.have.property("willValidate", false);
        expect(form.elements.hide).to.have.property("willValidate", false);

        form.elements.pattern.disabled = true;
        expect(form.elements.pattern).to.have.property("willValidate", false);
      });

      it("returns true otherwise", () => {
        const form = document.forms[0];
        expect(form.elements.size).to.have.property("willValidate", true);
        expect(form.elements.req).to.have.property("willValidate", true);
        expect(form.elements.reqsize).to.have.property("willValidate", true);
        expect(form.elements.step).to.have.property("willValidate", true);
        expect(form.elements.pattern).to.have.property("willValidate", true);
        expect(form.elements.uri).to.have.property("willValidate", true);
      });
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
      expect(() => form.elements.foo.setCustomValidity()).to.throw(TypeError, "Failed to execute 'setCustomValidity' on 'HTMLInputElement': 1 argument required, but only 0 present.");
    });

    it("setCustomValidity(null) sets 'null'", () => {
      const form = document.forms[0];
      form.elements.foo.setCustomValidity(null);
      expect(form.elements.foo.validationMessage).to.equal("null");
    });

    it("setCustomValidity(undefined) sets 'undefined'", () => {
      const form = document.forms[0];
      form.elements.foo.setCustomValidity(undefined);
      expect(form.elements.foo.validationMessage).to.equal("undefined");
    });

    it("checkValidity() returns false if required input is empty", () => {
      const form = document.forms[0];
      expect(form.elements.foo.checkValidity()).to.equal(false);
    });

    it("checkValidity() returns true if required input is disabled", () => {
      const form = document.forms[0];
      form.elements.foo.disabled = true;
      expect(form.elements.foo.checkValidity()).to.equal(true);
    });

    it("disabled required input is ignored", () => {
      const form = document.forms[0];

      let submitted = false;
      document.addEventListener("submit", () => submitted = true);

      form.elements.foo.disabled = true;
      document.getElementById("submit-form").click();
      expect(submitted).to.be.true;

      expect(form.elements.foo.validationMessage).to.equal("");
    });

    it("form submit is prevented if input is required", () => {
      const form = document.forms[0];

      let submitted = false;
      document.addEventListener("submit", () => submitted = true);

      document.getElementById("submit-form").click();
      expect(form.elements.foo.validationMessage).to.equal("Required");
      expect(form.elements.foo.validity).to.have.property("customError", true);

      expect(submitted).to.be.false;
    });

    it("oninput declaration can reset validation message", () => {
      const form = document.forms[0];

      let submitted = false;
      document.addEventListener("submit", () => submitted = true);

      document.getElementById("submit-form").click();
      expect(form.elements.foo.validationMessage).to.equal("Required");

      expect(submitted).to.be.false;

      form.elements.foo.value = "a";

      expect(form.elements.foo.validationMessage).to.equal("");

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

  describe("radio", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html><body>
            <form class="poll" data-uid="uid-1">
              <h3 class="poll__title">Is this a poll?</h3>
              <div class="poll__questionnaire">
                <label class="poll__label" for="67d01d_0">
                  <input id="67d01d_0" type="radio" name="answerUid" value="answer-id-1">
                  <span>First alternative</span>
                </label>
                <label class="poll__label" for="67d01d_1">
                  <input id="67d01d_1" type="radio" name="answerUid" value="answer-id-2">
                  <span>Second alternative</span>
                </label>
                <label class="poll__label" for="67d01d_2">
                  <input id="67d01d_2" type="radio" name="answerUid" value="answer-id-3">
                  <span>Third alternative</span>
                </label>
              </div>
              <div class="poll__buttons">
                <button class="button button--inverted poll__show-result">Visa resultat</button>
                <button type="submit" class="button poll__vote">Rösta</button>
              </div>
              <div class="poll__result-container hidden">
                <ul class="poll__results"></ul>
                <button class="button poll__back-to-poll" type="button">Gå tillbaka till frågan</button>
                <span class="poll__submit-message">Omröstningen är tänkt att ge en bild av vad läsarna på
                  Expressen.se tycker. Resultatet behöver inte vara representativt för alla och bör tolkas med försiktighet. Tack
                  för ditt svar.</span>
              </div>
            </form>
        </body></html>`
      });
    });

    it("submits form without any selection", () => {
      const form = document.forms[0];
      const submit = form.getElementsByTagName("button")[1];
      submit.click();
    });

    it("submits form with a selection", () => {
      const form = document.forms[0];
      form.getElementsByTagName("input")[1].click();
      const submit = form.getElementsByTagName("button")[1];
      submit.click();
    });
  });
});
