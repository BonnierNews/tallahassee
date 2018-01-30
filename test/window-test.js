"use strict";

const {Window, Document} = require("../lib");

describe("Window", () => {

  let window, document;
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

    window = Window({
      request: {
        header: {},
        url: "https://www.expressen.se/nyheter/article-slug/"
      }
    },
    {
      document: document
    }
    );
  });

  describe("properties", () => {
    it("has Element", () => {
      expect(window).to.have.property("Element");
    });
  });

  describe("history", () => {
    it("has property", () => {
      expect(window).to.have.property("history");
    });

    it("history has replaceState function", () => {
      expect(window.history).to.have.property("replaceState").that.is.a("function");
    });

    it("replaceState() sets new location", () => {
      window.history.replaceState(null, null, "/?a=1");
      expect(window.location).to.have.property("hostname", "www.expressen.se");
      expect(window.location).to.have.property("protocol", "https:");
      expect(window.location).to.have.property("pathname", "/");
      expect(window.location).to.have.property("path", "/?a=1");
      expect(window.location).to.have.property("search", "?a=1");

      window.history.replaceState(null, null, "/nyheter/article-slug-2/");
      expect(window.location).to.have.property("pathname", "/nyheter/article-slug-2/");
      expect(window.location).to.have.property("search").to.be.null;
    });
  });
});
