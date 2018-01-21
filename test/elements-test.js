"use strict";

const Document = require("../lib/Document");

const elementProperties = ["tagName",
  "id",
  "style",
  "type",
  "value",
  "name",
  "dataset",
  "disabled",
  "classList",
  "children",
  "lastElementChild",
  "lastChild",
  "outerHTML",
];

const elementApi = ["getElementsByTagName", "getElementsByClassName", "getBoundingClientRect"];

describe("elements", () => {
  describe("properties", () => {
    let document;
    beforeEach(() => {
      document = Document({
        text: `
          <html>
            <body>
              <h1>Elements</h1>
              <h2 id="headline">Test</h2>
              <input type="button">
              <script>var a = 1;</script>
              <img style="display: none;height:0">
            </body>
          </html>`
      });
    });

    it("element should have property tagName", () => {
      const children = document.body.children;
      expect(children).to.have.length.above(0);
      children.forEach((elm) => {
        expect(elm).to.have.property("tagName").that.match(/[A-Z]+/);
      });
    });

    elementProperties.forEach((name) => {
      it(`"${name}" should exist`, () => {
        const children = document.body.children;
        expect(children).to.have.length.above(0);
        children.forEach((elm) => {
          expect(elm, elm.tagName).to.have.property(name);
        });
      });
    });

    it("exposes classList with the expected behaviour", async () => {
      const [elm] = document.getElementsByTagName("h1");

      expect(elm.classList).to.be.ok;
      elm.classList.add("class-list");

      expect(elm.classList._classes).to.contain("class-list");

      elm.classList.toggle("class-list");
      expect(elm.classList._classes).to.not.contain("class-list");

      elm.classList.toggle("class-list", false);
      expect(elm.classList._classes).to.not.contain("class-list");

      elm.classList.toggle("class-list", true);
      expect(elm.classList._classes).to.contain("class-list");

      elm.classList.toggle("class-list");
      expect(elm.classList._classes).to.not.contain("class-list");

      elm.classList.add("class-list", "second-class");
      expect(elm.classList._classes).to.include.members(["class-list", "second-class"]);

      elm.classList.remove("class-list", "second-class");
      expect(elm.classList._classes).to.not.include.members(["class-list", "second-class"]);
    });

    it("exposes disabled with the expected behaviour on input element", async () => {
      const [elm] = document.getElementsByTagName("input");
      expect(elm).to.have.property("disabled").that.is.false;
      elm.disabled = true;
      expect(elm.outerHTML).to.equal("<input type=\"button\" disabled=\"disabled\">");
      elm.disabled = false;
      expect(elm.outerHTML).to.equal("<input type=\"button\">");
    });

    it("exposes disabled with the expected behaviour on non-input element", async () => {
      const [elm] = document.getElementsByTagName("h2");
      expect(elm).to.have.property("disabled").that.is.undefined;
      elm.disabled = true;
      expect(elm.outerHTML).to.equal("<h2 id=\"headline\" disabled=\"disabled\">Test</h2>");
      elm.disabled = false;
      expect(elm.outerHTML).to.equal("<h2 id=\"headline\">Test</h2>");
    });

    it("exposes style with the expected behaviour", async () => {
      const [elm] = document.getElementsByTagName("h2");
      expect(elm).to.have.property("style").that.eql({});
      elm.style.display = "none";
      expect(elm.outerHTML).to.equal("<h2 id=\"headline\" style=\"display: none;\">Test</h2>");
      elm.style.removeProperty("display");
      expect(elm.outerHTML).to.equal("<h2 id=\"headline\">Test</h2>");

      const [img] = document.getElementsByTagName("img");
      expect(img.style).to.eql({
        display: "none",
        height: "0"
      });

      img.style.height = "12px";
      img.style.width = "0";
      expect(img.getAttribute("style")).to.equal("display: none;height: 12px;width: 0;");
    });
  });

  describe("api", () => {
    let document;
    beforeEach(() => {
      document = Document({
        text: `
          <html>
            <body>
              <h2 id="headline">Test</h2>
              <input type="button">
              <script>var a = 1;</script>
            </body>
          </html>`
      });
    });

    elementApi.forEach((name) => {
      it(`"${name}" should be a function`, () => {
        const children = document.body.children;
        expect(children).to.have.length.above(0);
        children.forEach((elm) => {
          expect(elm, elm.tagName).to.have.property(name).and.be.a("function");
        });
      });
    });
  });

  describe("input[type=radio]", () => {
    let document;
    beforeEach(() => {
      document = Document({
        text: `
          <html>
            <body>
              <input type="radio" name="test" value="1" checked="checked">
              <input type="radio" name="test" value="2">
            </body>
          </html>`
      });
    });

    it("has checked true if checked", () => {
      expect(document.getElementsByTagName("input")[0].checked).to.be.true;
    });

    it("has checked false if not checked", () => {
      expect(document.getElementsByTagName("input")[1].checked).to.be.false;
    });

    it("has value", () => {
      expect(document.getElementsByTagName("input")[0].value).to.equal("1");
      expect(document.getElementsByTagName("input")[1].value).to.equal("2");
    });

    it("can set checked", () => {
      const elm = document.getElementsByTagName("input")[1];
      elm.checked = true;
      expect(elm.checked).to.be.true;
    });

    it("unsets checked on siblings", () => {
      const elms = document.getElementsByTagName("input");
      elms[1].checked = true;
      expect(elms[0].checked).to.be.false;
    });

    it("unsets checked on siblings in same form", () => {
      document = Document({
        text: `
          <html>
            <body>
              <form id="form1">
                <input type="radio" name="test" value="1" checked="checked">
                <input type="radio" name="test" value="2">
              </form>
              <form id="form2">
                <input type="radio" name="test" value="1" checked="checked">
                <input type="radio" name="test" value="2">
              </form>
            </body>
          </html>`
      });

      const elms1 = document.getElementById("form1").getElementsByTagName("input");
      elms1[1].checked = true;
      expect(elms1[0].checked).to.be.false;

      const elms2 = document.getElementById("form2").getElementsByTagName("input");
      expect(elms2[0].checked).to.be.true;
      expect(elms2[1].checked).to.be.false;
    });
  });

  describe(".textContent", () => {
    let document;
    beforeEach(() => {
      document = Document({
        text: `
          <html>
            <body>
              <h2>Test</h2>
              <script>var a = 1;</script>
            </body>
          </html>`
      });
    });

    it("returns null on document", () => {
      expect(document).to.have.property("textContent", null);
    });

    it("returns text content of element", () => {
      expect(document.getElementsByTagName("h2")[0]).to.have.property("textContent", "Test");
    });

    it("sets text content of element", () => {
      const elm = document.getElementsByTagName("h2")[0];
      elm.textContent = "Modified test";
      expect(elm).to.have.property("textContent", "Modified test");
    });

    it("returns text content of script element", () => {
      expect(document.getElementsByTagName("script")[0]).to.have.property("textContent", "var a = 1;");
    });

    it("sets text content of script element", () => {
      const elm = document.getElementsByTagName("script")[0];
      elm.textContent = "var b = 2;";
      expect(elm).to.have.property("textContent", "var b = 2;");
    });

  });
});