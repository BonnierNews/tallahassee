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

  describe("scroll", () => {
    it("should set x coordinate properly", () => {
      window.scroll(100, 0);
      expect(window.pageXOffset).to.equal(100);
    });

    it("should set y coordinate properly", () => {
      window.scroll(0, 100);
      expect(window.pageYOffset).to.equal(100);
    });

    it("should set y coordinate properly with object parameters and value being 0", () => {
      window.scroll({top: 100});
      expect(window.pageYOffset).to.equal(100);
      window.scroll({top: 0});
      expect(window.pageYOffset).to.equal(0);
    });

    it("should set x coordinate properly with object parameters and value being 0", () => {
      window.scroll({left: 100});
      expect(window.pageXOffset).to.equal(100);
      window.scroll({left: 0});
      expect(window.pageXOffset).to.equal(0);
    });

    it("should set y coordinate properly with object parameters", () => {
      window.scroll({top: 100});
      expect(window.pageYOffset).to.equal(100);
      expect(window.pageXOffset).to.equal(0);
    });

    it("should set x coordinate properly with object parameters", () => {
      window.scroll({left: 100});
      expect(window.pageXOffset).to.equal(100);
      expect(window.pageYOffset).to.equal(0);
    });

    it("should set both coordinates properly with object parameters", () => {
      window.scroll({top: 100, left: 100});
      expect(window.pageXOffset).to.equal(100);
      expect(window.pageYOffset).to.equal(100);
    });

    it("allows null as x", () => {
      window.scroll(null, 100);
      expect(window.pageYOffset).to.equal(100);
    });
  });

  describe("location", () => {
    it("exposes location", () => {
      const wdw = Window({
        request: {
          header: {},
          url: "https://www.expressen.se/nyheter/article-slug/?q=1"
        }
      });

      expect(wdw.location).to.have.property("href", "https://www.expressen.se/nyheter/article-slug/?q=1");
      expect(wdw.location).to.have.property("protocol", "https:");
      expect(wdw.location).to.have.property("host", "www.expressen.se");
      expect(wdw.location).to.have.property("pathname", "/nyheter/article-slug/");
      expect(wdw.location).to.have.property("path", "/nyheter/article-slug/?q=1");
      expect(wdw.location).to.have.property("search", "?q=1");
    });

    it("has setter", () => {
      const wdw = Window({
        request: {
          header: {},
          url: "https://www.expressen.se/nyheter/article-slug/?q=1"
        }
      });

      wdw.location = "https://www.expressen.se/nyheter/";

      expect(wdw.location).to.have.property("href", "https://www.expressen.se/nyheter/");
      expect(wdw.location).to.have.property("protocol", "https:");
      expect(wdw.location).to.have.property("host", "www.expressen.se");
      expect(wdw.location).to.have.property("pathname", "/nyheter/");
      expect(wdw.location).to.have.property("path", "/nyheter/");
      expect(wdw.location).to.have.property("search", null);
    });

    it("property can be replaced for testing purposes", () => {
      const wdw = Window({
        request: {
          header: {},
          url: "https://www.expressen.se/nyheter/article-slug/?q=1"
        }
      });

      delete wdw.location;

      wdw.location = "https://www.expressen.se/nyheter/";

      expect(wdw.location).to.equal("https://www.expressen.se/nyheter/");
    });

    it("supports relative path", () => {
      const wdw = Window({
        request: {
          header: {},
          url: "https://www.expressen.se/nyheter/article-slug/?q=1"
        }
      });

      wdw.location = "/nyheter/";

      expect(wdw.location).to.have.property("href", "https://www.expressen.se/nyheter/");
      expect(wdw.location).to.have.property("protocol", "https:");
      expect(wdw.location).to.have.property("host", "www.expressen.se");
      expect(wdw.location).to.have.property("pathname", "/nyheter/");
      expect(wdw.location).to.have.property("path", "/nyheter/");
      expect(wdw.location).to.have.property("search", null);
    });

    it("emits unload on window if set", (done) => {
      const wdw = Window({
        request: {
          header: {},
          url: "https://www.expressen.se/nyheter/article-slug/?q=1"
        }
      });

      wdw.addEventListener("unload", () => {
        done();
      });

      wdw.location = "https://www.expressen.se/nyheter/";
    });

    it("emits unload even if changed to the same url", (done) => {
      const wdw = Window({
        request: {
          header: {},
          url: "https://www.expressen.se/nyheter/article-slug/?q=1"
        }
      });

      wdw.addEventListener("unload", () => {
        done();
      });

      wdw.location = "https://www.expressen.se/nyheter/article-slug/?q=1";
    });

    it("doesn't emit unload if changed to the same url with hash", () => {
      const wdw = Window({
        request: {
          header: {},
          url: "https://www.expressen.se/nyheter/article-slug/"
        }
      });

      let fired = false;
      wdw.addEventListener("unload", () => {
        fired = true;
      });

      wdw.location = "https://www.expressen.se/nyheter/article-slug/#1";

      expect(fired).to.be.false;
    });
  });

  describe("window.atob()", () => {
    it("decodes base64 encoded string", () => {
      const wdw = Window({
        request: {
          header: {},
          url: "https://www.expressen.se/nyheter/article-slug/"
        }
      });

      expect(wdw.atob(Buffer.from("obfusca", "latin1").toString("base64"))).to.equal("obfusca");
      expect(wdw.atob(Buffer.from("obfuscåa", "latin1").toString("base64"))).to.equal("obfuscåa");
      expect(wdw.atob(Buffer.from("obfusc😭a", "latin1").toString("base64"))).to.equal("obfusc=-a");
    });

    it("throws if trying to decode invalid base64 string", () => {
      const wdw = Window({
        request: {
          header: {},
          url: "https://www.expressen.se/nyheter/article-slug/"
        }
      });

      expect(() => wdw.atob("s")).to.throw(/not correctly encoded/);
      expect(() => wdw.atob({})).to.throw(/not correctly encoded/);
      expect(() => wdw.atob(undefined)).to.throw(/not correctly encoded/);
    });

    it("called with no arg is NOT ok", () => {
      const wdw = Window({
        request: {
          header: {},
          url: "https://www.expressen.se/nyheter/article-slug/"
        }
      });

      expect(() => wdw.atob()).to.throw(TypeError);
    });
  });

  describe("window.btoa()", () => {
    it("decodes base64 encoded string as latin1", () => {
      const wdw = Window({
        request: {
          header: {},
          url: "https://www.expressen.se/nyheter/article-slug/"
        }
      });

      expect(wdw.btoa("pål med å inte äöáÿ")).to.equal("cOVsIG1lZCDlIGludGUg5Pbh/w==");
    });

    it("throws if trying to encode chars outside latin1 range (>255)", () => {
      const wdw = Window({
        request: {
          header: {},
          url: "https://www.expressen.se/nyheter/article-slug/"
        }
      });

      expect(() => wdw.btoa("ÿ Ā")).to.throw(/latin1/i);
      expect(() => wdw.btoa("\u0100")).to.throw(/latin1/i);
      expect(() => wdw.btoa("\u00FF")).to.not.throw();
    });

    it("called with undefined is ok", () => {
      const wdw = Window({
        request: {
          header: {},
          url: "https://www.expressen.se/nyheter/article-slug/"
        }
      });

      expect(() => wdw.btoa(undefined)).to.not.throw();
    });

    it("called with no arg is NOT ok", () => {
      const wdw = Window({
        request: {
          header: {},
          url: "https://www.expressen.se/nyheter/article-slug/"
        }
      });

      expect(() => wdw.btoa()).to.throw(TypeError);
    });
  });
});
