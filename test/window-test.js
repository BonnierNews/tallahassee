"use strict";

const {Window} = require("../lib");

describe("Window", () => {
  let window;
  beforeEach(() => {
    window = Window({
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
    it("has Element", () => {
      expect(window.Element).to.be.ok;
    });
  });
});
