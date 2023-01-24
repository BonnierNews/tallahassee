"use strict";

const Document = require("../lib/Document");

describe("forms", () => {
  let document;
  beforeEach(() => {
    document = new Document({
      text: `
        <html>
          <body>
            <h2>Test <b>title</b></h2>
            <form id="get-form" type="get" action="/">
              <input type="checkbox" value="1">
              <input type="checkbox" value="2" checked="checked">
              <select>
                <option value="1">1</option>
                <option value="2" selected="selected">2</option>
              </select>
              <label>Description<textarea name="multiline"></textarea></label>
              <input name="myinput" type="text">
              <input name="myemail" type="email">
              <input name="mynumber" type="number">
              <input name="mytel" type="tel">
              <fieldset>
                <legend>Legend text</legend>
              </fieldset>
              <input type="file" name="file" accept="image/png">
              <button type="submit">Submit</submit>
              <button>Submit</submit>
              <button type="reset">Reset</submit>
            </form>
            <form id="default-form">
            </form>
          </body>
        </html>`
    });
  });

  it("has submit method", () => {
    expect(document.getElementById("get-form")).to.have.property("submit").that.is.a("function");
  });

  it("has reset method", () => {
    expect(document.getElementById("get-form")).to.have.property("reset").that.is.a("function");
    expect(document.getElementById("get-form")).to.have.property("reset").that.is.a("function");
  });

  it("returns the same form twice", () => {
    expect(document.getElementById("get-form") === document.getElementById("get-form")).to.be.true;
  });

  it("has action property", () => {
    expect(document.getElementById("get-form").action).to.equal("/");
  });

  it("can set action property", () => {
    const form = document.getElementById("get-form");
    form.action = "/test";
    expect(form.action).to.equal("/test");
  });

  it("has default action property value", () => {
    expect(document.getElementById("default-form").action).to.equal("https://localhost:3000/");
  });

  it("has method property", () => {
    expect(document.getElementById("get-form").method).to.equal("get");
  });

  it("can set method property (to valid value)", () => {
    const form = document.getElementById("get-form");

    expect(form.method = "invalid").to.equal("invalid");
    expect(form.method).to.equal("get");

    expect(form.method = 1).to.equal(1);
    expect(form.method).to.equal("get");

    expect(form.method = null).to.equal(null);
    expect(form.method).to.equal("get");

    expect(form.method = "post").to.equal("post");
    expect(form.method).to.equal("post");

    expect(form.method = "get").to.equal("get");
    expect(form.method).to.equal("get");
  });

  it("has default method property value", () => {
    expect(document.getElementById("default-form").method).to.equal("get");
  });

  it("submit button has associated form property", () => {
    const [form] = document.getElementsByTagName("form");
    const [button] = document.getElementsByTagName("button");

    expect(form === button.form).to.be.true;
  });

  it("submit button click emits submit on document", (done) => {
    const [button] = document.getElementsByTagName("button");

    document.addEventListener("submit", () => done());

    button.click();
  });

  it("submit button click emits submit on form", (done) => {
    const [form] = document.getElementsByTagName("form");
    const [button] = document.getElementsByTagName("button");

    form.addEventListener("submit", () => done());

    button.click();
  });

  it("typeless button click emits submit on form", (done) => {
    const [form] = document.getElementsByTagName("form");
    const [, button] = document.getElementsByTagName("button");

    form.addEventListener("submit", () => done());

    button.click();
  });

  it("submit sets event target to form", (done) => {
    const form = document.getElementsByTagName("form")[0];
    const button = document.getElementsByTagName("button")[0];

    document.addEventListener("submit", (event) => {
      expect(event.target === form, "event target is not form").to.be.true;
      done();
    });

    button.click();
  });

  it("reset button click emits reset on form", (done) => {
    const form = document.getElementsByTagName("form")[0];
    const button = form.getElementsByTagName("button")[2];

    form.addEventListener("reset", () => done());

    button.click();
  });

  it("reset form resets form elements", () => {
    const form = document.getElementsByTagName("form")[0];
    const select = form.getElementsByTagName("select")[0];
    const checkboxes = form.getElementsByTagName("input");

    select.options[0].selected = true;

    checkboxes[0].checked = true;
    checkboxes[1].checked = false;

    form.reset();

    expect(select.options[0].selected).to.be.false;
    expect(select.options[1].selected).to.be.true;

    expect(checkboxes[0].checked).to.be.false;
    expect(checkboxes[1].checked).to.be.true;
  });

  it("input can get and set value", () => {
    const input = document.getElementsByTagName("input")[0];
    expect(input).to.have.property("value", "1");
    input.value = 3;
    expect(input).to.have.property("value", "3");
  });

  it("textarea can get and set value", () => {
    const input = document.getElementsByTagName("textarea")[0];
    expect(input).to.have.property("value", "");
    input.value = "line 1\nline 2";
    expect(input).to.have.property("value", "line 1\nline 2");
  });

  it("set innerHTML on textarea keeps value", () => {
    const input = document.getElementsByTagName("textarea")[0];
    input.value = "foo\nbar";
    input.innerHTML = "&lt;p&gt;A test&lt;/p&gt;";
    expect(input.value).to.equal("foo\nbar");
  });

  it("set innerText on textarea keeps value", () => {
    const input = document.getElementsByTagName("textarea")[0];
    input.value = "foo\nbar";
    input.innerText = "&lt;p&gt;A test&lt;/p&gt;";
    expect(input.value).to.equal("foo\nbar");
  });

  it("button can get and set value", () => {
    const button = document.getElementsByTagName("button")[0];
    expect(button).to.have.property("value", "");
    button.value = "send";
    expect(button).to.have.property("value", "send");
  });

  it("form property elements return form fields", () => {
    const form = document.getElementsByTagName("form")[0];
    expect(form).to.have.property("elements");
    const elements = form.elements;
    expect(elements.length).to.equal(12);
    for (let i = 0; i < elements.length; ++i) {
      expect(["INPUT", "BUTTON", "SELECT", "TEXTAREA", "FIELDSET"].indexOf(elements[i].tagName), elements[i].tagName).to.be.above(-1);
    }
  });

  it("named input field can be retreived by named property", () => {
    const form = document.getElementsByTagName("form")[0];
    expect(form.elements.myinput).to.be.ok;
    expect(form.elements.myinput.name).to.equal("myinput");
    expect(form.elements.myinput.tagName).to.equal("INPUT");
  });

  it("unknown input field returns undefined", () => {
    const form = document.getElementsByTagName("form")[0];
    expect(form.abrakadabra === undefined).to.be.true;
  });

  it("added property is returned", () => {
    const form = document.getElementsByTagName("form")[0];
    const obj = form.abrakadabra = {};
    expect(form.abrakadabra === obj).to.be.true;
  });

  it("fieldset returns closest form", () => {
    const fieldset = document.getElementsByTagName("fieldset")[0];
    expect(fieldset.form).to.equal(document.forms[0]);
  });

  it("legend returns closest form", () => {
    const legend = document.getElementsByTagName("legend")[0];
    expect(legend.form).to.equal(document.forms[0]);
  });

  it("input can get and set accept", () => {
    const form = document.getElementsByTagName("form")[0];
    const file = form.elements.file;
    expect(file.accept).to.equal("image/png");
    expect(file).to.have.property("accept", "image/png");
    file.accept = "image/jpg";
    expect(file).to.have.property("accept", "image/jpg");
  });

  it("input can get files that are 'uploaded' and fire change event", (done) => {
    const form = document.getElementsByTagName("form")[0];
    const file = form.elements.file;
    expect(file.files).to.deep.equal([]);
    file.addEventListener("input", () => done());
    file._uploadFile("dummy");
    expect(file.files).to.deep.equal(["dummy"]);
  });

  it("input can get value of uploaded file", (done) => {
    const form = document.getElementsByTagName("form")[0];
    const file = form.elements.file;
    expect(file.value).to.equal("");
    file._uploadFile({name: "dummy"});
    expect(file.value).to.deep.equal("C:\\fakepath\\dummy");
    file.addEventListener("input", () => done());
    file.value = "";
  });

  it("input does not fire change event if files are not changed", () => {
    const form = document.getElementsByTagName("form")[0];
    const file = form.elements.file;
    expect(file.files).to.deep.equal([]);
    let events = 0;
    file.addEventListener("input", () => events++);
    file._uploadFile("dummy");
    file._uploadFile("dummy");
    expect(file.files).to.deep.equal(["dummy"]);
    expect(events).to.equal(1);
  });

  it("input only contains one file unless multiple", () => {
    const form = document.getElementsByTagName("form")[0];
    const file = form.elements.file;
    expect(file.files).to.deep.equal([]);

    file._uploadFile("dummy1");
    expect(file.files).to.deep.equal(["dummy1"]);
    file._uploadFile("dummy2");
    expect(file.files).to.deep.equal(["dummy2"]);
    file.multiple = true;
    file._uploadFile("dummy1");
    expect(file.files).to.deep.equal(["dummy2", "dummy1"]);
  });

  describe("disabled", () => {
    [ "input", "button", "select", "textarea" ].forEach((tagName) => {
      it(`${tagName} have disabled property`, () => {
        const form = document.forms[0];
        const elm = form.getElementsByTagName(tagName)[0];
        expect(elm, tagName).to.have.property("disabled");
        elm.disabled = true;
      });

      it(`${tagName} have value property`, () => {
        const form = document.forms[0];
        const elm = form.getElementsByTagName(tagName)[0];
        expect(elm, tagName).to.have.property("value");

        expect(elm.value = "val", "set value").to.equal("val");
      });
    });

    it("h2 lacks disabled and value property", () => {
      const elm = document.getElementsByTagName("h2")[0];
      expect(elm).to.not.have.property("disabled");
      expect(elm).to.not.have.property("value");
    });
  });

  describe("readOnly", () => {
    [ "input", "textarea" ].forEach((tagName) => {
      it(`${tagName} have readOnly property`, () => {
        const form = document.forms[0];
        const elm = form.getElementsByTagName(tagName)[0];
        expect(elm, tagName).to.have.property("readOnly");
        elm.readOnly = true;
      });

      it(`${tagName} have value property`, () => {
        const form = document.forms[0];
        const elm = form.getElementsByTagName(tagName)[0];
        expect(elm, tagName).to.have.property("value");

        expect(elm.value = "val", "set value").to.equal("val");
      });
    });

    it("h2 lacks readOnly and value property", () => {
      const elm = document.getElementsByTagName("h2")[0];
      expect(elm).to.not.have.property("readOnly");
      expect(elm).to.not.have.property("value");
    });

    it("button lacks readOnly property", () => {
      const elm = document.getElementsByTagName("button")[0];
      expect(elm).to.not.have.property("readOnly");
    });

    it("select lacks readOnly property", () => {
      const elm = document.getElementsByTagName("select")[0];
      expect("readOnly" in elm).to.be.false;
    });
  });

  describe("required", () => {
    [ "input", "textarea", "select" ].forEach((tagName) => {
      it(`${tagName} have required property`, () => {
        const form = document.forms[0];
        const elm = form.getElementsByTagName(tagName)[0];
        expect("required" in elm, tagName).to.be.true;
        elm.required = true;
      });
    });

    it("h2 lacks required property", () => {
      const elm = document.getElementsByTagName("h2")[0];
      expect(elm).to.not.have.property("required");
    });

    it("button lacks required property", () => {
      const elm = document.getElementsByTagName("button")[0];
      expect(elm).to.not.have.property("required");
    });
  });

  describe("multiple", () => {
    [ "input", "select" ].forEach((tagName) => {
      it(`${tagName} have multiple property`, () => {
        const form = document.forms[0];
        const elm = form.getElementsByTagName(tagName)[0];
        expect("multiple" in elm, tagName).to.be.true;
        elm.multiple = true;
      });
    });

    it("h2 lacks multiple property", () => {
      const elm = document.getElementsByTagName("h2")[0];
      expect(elm).to.not.have.property("multiple");
    });

    it("button lacks multiple property", () => {
      const elm = document.getElementsByTagName("button")[0];
      expect(elm).to.not.have.property("multiple");
    });
  });

  describe("events", () => {
    [
      "input[type=text]",
      "input[type=email]",
      "input[type=tel]",
      "input[type=number]",
      "textarea",
      "select"
    ].forEach((tagName) => {
      it(`should fire 'input' event on ${tagName} when value is changed`, (done) => {
        const el = document.querySelector(tagName);
        el.addEventListener("input", () => done());

        el.value = "1";
      });
    });
  });
});
