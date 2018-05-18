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
      document
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
      const result = window.clearTimeout();
      expect(result).to.be.undefined;
    });
  });

  describe("navigator", () => {
    it(".userAgent returns Tallahassee by default", () => {
      const wndw = Window({
        request: {
          header: {},
          url: "https://www.expressen.se/nyheter/article-slug/"
        }
      }, {document});

      expect(wndw.navigator).to.have.property("userAgent", "Tallahassee");
    });

    it(".userAgent is returns User-Agent header", () => {
      const wndw = Window({
        request: {
          header: {
            "User-Agent": "Mozilla/5.0"
          },
          url: "https://www.expressen.se/nyheter/article-slug/"
        }
      }, {document});

      expect(wndw.navigator).to.have.property("userAgent", "Mozilla/5.0");
    });

    it(".userAgent is read only", () => {
      const wndw = Window({
        request: {
          header: {},
          url: "https://www.expressen.se/nyheter/article-slug/"
        }
      }, {document});

      wndw.navigator.userAgent = "Zombie";
      expect(wndw.navigator).to.have.property("userAgent", "Tallahassee");
    });

    it(".geolocation is returns expected api", () => {
      const wndw = Window({
        request: {
          header: {},
          url: "https://www.expressen.se/nyheter/article-slug/"
        }
      }, {document});

      expect(wndw.navigator).to.have.property("geolocation");
      expect(wndw.navigator.geolocation.getCurrentPosition).to.be.a("function");
      expect(wndw.navigator.geolocation.watchPosition).to.be.a("function");
      expect(wndw.navigator.geolocation.clearWatch).to.be.a("function");
    });

    it(".geolocation is read only", () => {
      const wndw = Window({
        request: {
          header: {},
          url: "https://www.expressen.se/nyheter/article-slug/"
        }
      }, {document});

      wndw.navigator.geolocation = () => {};
      expect(wndw.navigator.geolocation.getCurrentPosition).to.be.a("function");
    });
  });

  describe("events ", () => {
    it(".dispatchEvent() emits passed event type as string", (done) => {
      window.addEventListener("test-event", done);
      window.dispatchEvent("test-event");
    });

    it(".dispatchEvent() takes object (Event) with type and emits event with type as name", (done) => {
      window.addEventListener("test-event", (arg) => {
        expect(arg).to.eql({type: "test-event"});
        done();
      });
      window.dispatchEvent({type: "test-event"});
    });

    it(".dispatchEvent() throws if no argument is passed", () => {
      expect(() => {
        window.dispatchEvent();
      }).to.throw(TypeError);
    });

    it("can dispatch window.Event", (done) => {
      window.addEventListener("test-event", (arg) => {
        expect(arg).to.have.property("type", "test-event");
        done();
      });
      window.dispatchEvent(new window.Event("test-event"));
    });
  });

  describe("matchMedia", () => {
    it("should throw with no arguments passed", () => {
      expect(() => window.matchMedia()).to.throw(TypeError);
    });

    it("should check towards default media object which is 'screen'", () => {
      const media = window.matchMedia("screen");
      expect(media).to.eql({ media: "screen", matches: true });
    });

    it("should return media object that does not match", () => {
      window.styleMedia = { type: "print" };
      const media = window.matchMedia("screen");
      expect(media).to.eql({ media: "screen", matches: false });
    });

    it("should return media object that does match", () => {
      window.styleMedia = { type: "print" };
      const media = window.matchMedia("print");
      expect(media).to.eql({ media: "print", matches: true });
    });
  });
});
