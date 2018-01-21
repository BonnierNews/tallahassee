"use strict";

const {Document} = require("../lib");

describe("Document", () => {
  let document;
  beforeEach(() => {
    document = Document({
      request: {
        header: {
          cookie: "_ga=1"
        },
        url: "https://www.expressen.se/nyheter/article-slug/"
      },
      text: `
        <html>
          <body>
            <h2 id="headline">Test</h2>
            <input type="button"
            <script>var a = 1;</script>
          </body>
        </html>`
    });
  });

  describe("properties", () => {
    it("has location", () => {
      expect(document.location).to.be.ok;
      expect(document.location).to.have.property("host", "www.expressen.se");
      expect(document.location).to.have.property("pathname", "/nyheter/article-slug/");
    });

    it("has cookie", () => {
      expect(document.cookie).to.be.ok;
    });

    it("can set cookie", () => {
      document.cookie = "_new=2";
      expect(document.cookie).to.equal("_ga=1;_new=2;");
    });

    it("doesn't expose classList on document", async () => {
      expect(document.classList, "classList on document").to.be.undefined;
    });
  });

  describe("api", () => {
    it("getElementById returns element if found", async () => {
      const elm = document.getElementById("headline");
      expect(elm).to.be.ok;
      expect(elm.getElementById, "getElementById on element").to.be.undefined;
    });

    it("getElementById returns null id element is not found", async () => {
      expect(document.getElementById("non-existing")).to.be.null;
    });
  });

  describe("_getElement()", () => {

    it("returns the same element when called twice", () => {
      const $ = document.$;
      const call1 = document._getElement($("#headline"));
      const call2 = document._getElement($("#headline"));

      expect(call1 === call2).to.be.true;
    });
  });
});
