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
            <template id="schablon">
              <div id="insert">
                <p>Template</p>
              </div>
            </template>
            <div id="lazy"></div>
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

    it("doesn't expose classList on document", async () => {
      expect(document.classList, "classList on document").to.be.undefined;
    });

    it("exposes documentElement with expected behaviour", async () => {
      expect(document.documentElement).to.have.property("tagName", "HTML");
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

    it("importNode() returns element content", async () => {
      const elm = document.getElementById("schablon");
      expect(document.importNode(elm, true)).to.be.ok;
      expect(document.importNode(elm, true).firstChild.tagName).to.equal("DIV");
    });

    it("importNode() combined with appendChild() inserts element content", async () => {
      const elm = document.getElementById("schablon");
      const template = document.importNode(elm, true);
      document.getElementById("lazy").appendChild(template);

      expect(document.getElementById("insert")).to.be.ok;
      expect(document.getElementById("insert").parentElement.id).to.equal("lazy");
    });

    it("template element.content importNode() combined with appendChild() inserts element content", async () => {
      const elm = document.getElementById("schablon");
      const template = document.importNode(elm.content, true);
      document.getElementById("lazy").appendChild(template);

      expect(document.getElementById("insert")).to.be.ok;
      expect(document.getElementById("insert").parentElement.id).to.equal("lazy");
    });
  });

  describe("createTextNode()", () => {
    it("returns a text node", () => {
      const textNode = document.createTextNode("test");
      expect(textNode.textContent === "test");
    });

    it("TextNode is appended to parent element", () => {
      const parent = document.createElement("span");
      const textNode = document.createTextNode("test");
      parent.appendChild(textNode);

      document.body.appendChild(parent);
      const span = document.getElementsByTagName("span")[0];

      expect(span.outerHTML).to.equal("<span>test</span>");
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

  describe("cookie", () => {
    it("has cookie", () => {
      expect(document.cookie).to.be.ok;
    });

    it("can set cookie", () => {
      document.cookie = "_new=2";
      expect(document.cookie).to.equal("_ga=1;_new=2;");
    });

    it("overwrites cookie with same name", () => {
      document.cookie = "_writable=2";
      document.cookie = "_writable=3";
      expect(document.cookie).to.equal("_ga=1;_writable=3;");
    });

    it("URI encodes when setting value", () => {
      document.cookie = "_writable=2 3";
      expect(document.cookie).to.equal("_ga=1;_writable=2%203;");
    });

    it("can set cookie value to blank", () => {
      document.cookie = "_writable=4";
      expect(document.cookie).to.equal("_ga=1;_writable=4;");

      document.cookie = "_writable=";
      expect(document.cookie).to.equal("_ga=1;_writable=;");

      document.cookie = "_writable=44 ";
      expect(document.cookie).to.equal("_ga=1;_writable=44;");
    });
  });
});
