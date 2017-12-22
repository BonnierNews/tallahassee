"use strict";

const Document = require("../lib/Document");

describe("elements", () => {
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
