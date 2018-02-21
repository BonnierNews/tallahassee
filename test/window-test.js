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

  describe("requestAnimationFrame", () => {
    it("executes callback with timestamp immediately", () => {
      let called;
      const callback = (timestamp) => {
        called = timestamp;
      };

      window.requestAnimationFrame(callback);

      expect(called).to.be.a("number");
      expect(isNaN(called)).to.be.false;
    });

    it("returns arbitrary number", () => {
      const result = window.requestAnimationFrame(() => {});

      expect(result).to.be.a("number");
      expect(isNaN(result)).to.be.false;
    });
  });

  describe("cancelAnimationFrame", () => {
    it("does nothing", () => {
      const result = window.cancelAnimationFrame();
      expect(result).to.be.undefined;
    });
  });

  describe("setTimeout", () => {
    it("should execute callback immediately with arguments", () => {
      let parameters;
      const callback = (...args) => {
        parameters = args;
      };

      window.setTimeout(callback, 0, "foo", "bar");

      expect(parameters).to.eql(["foo", "bar"]);
    });

    it("should return arbitrary ID number", () => {
      const result = window.setTimeout(() => {});

      expect(result).to.be.a("number");
      expect(isNaN(result)).to.be.false;
    });
  });

  describe("clearTimeout", () => {
    it("should do nothing", () => {
      it("does nothing", () => {
        const result = window.clearTimeout();
        expect(result).to.be.undefined;
      });
    });
  });
});
