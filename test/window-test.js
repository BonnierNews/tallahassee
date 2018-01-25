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
});
