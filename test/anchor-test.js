"use strict";

const { Document } = require("../lib/index.js");

describe("Anchor", () => {
  describe("Anchor properties", () => {
    let document, anchors;
    beforeEach("a DOM with anchors", () => {
      document = new Document({
        url: "https://www.expressen.se/",
        text: `
          <html>
            <body>
              <a href="//example.com/test">Absolute link no protocol</a>
              <a href="http://example.com">Absolute link with protocol</a>
              <a href="http://www.example.com?w=1">Absolute link with search</a>
              <a href="/slug/">Relative link</a>
              <a href="/?signed_out=true">Relative link with query parameter</a>
              <a href="#tag">Relative link with hash</a>
              <a href="http://localhost:30080/path">Link with port and path</a>
              <a>Not defined</a>
              <a href="">Empty</a>
            </body>
          </html>`,
      });

      anchors = document.getElementsByTagName("a");
    });

    it("get href returns full href with protocol, domain, and path", () => {
      expect(anchors[0].href, anchors[0].textContent).to.equal("https://example.com/test");
      expect(anchors[1].href, anchors[1].textContent).to.equal("http://example.com/");
      expect(anchors[2].href, anchors[2].textContent).to.equal("http://www.example.com/?w=1");
      expect(anchors[3].href, anchors[3].textContent).to.equal("https://www.expressen.se/slug/");
      expect(anchors[4].href, anchors[4].textContent).to.equal("https://www.expressen.se/?signed_out=true");
      expect(anchors[5].href, anchors[5].textContent).to.equal("https://www.expressen.se/#tag");
      expect(anchors[6].href, anchors[5].textContent).to.equal("http://localhost:30080/path");
    });

    it("get protocol returns href protocol", () => {
      expect(anchors[0].protocol, anchors[0].textContent).to.equal("https:");
      expect(anchors[1].protocol, anchors[1].textContent).to.equal("http:");
      expect(anchors[2].protocol, anchors[2].textContent).to.equal("http:");
      expect(anchors[3].protocol, anchors[3].textContent).to.equal("https:");
      expect(anchors[4].protocol, anchors[4].textContent).to.equal("https:");
      expect(anchors[5].protocol, anchors[5].textContent).to.equal("https:");
      expect(anchors[6].protocol, anchors[6].textContent).to.equal("http:");
    });

    it("get hostname returns href hostname", () => {
      expect(anchors[0].hostname, anchors[0].textContent).to.equal("example.com");
      expect(anchors[1].hostname, anchors[1].textContent).to.equal("example.com");
      expect(anchors[2].hostname, anchors[2].textContent).to.equal("www.example.com");
      expect(anchors[3].hostname, anchors[3].textContent).to.equal("www.expressen.se");
      expect(anchors[4].hostname, anchors[4].textContent).to.equal("www.expressen.se");
      expect(anchors[5].hostname, anchors[5].textContent).to.equal("www.expressen.se");
      expect(anchors[6].hostname, anchors[6].textContent).to.equal("localhost");
    });

    it("get host returns href host", () => {
      expect(anchors[0].host, anchors[0].textContent).to.equal("example.com");
      expect(anchors[1].host, anchors[1].textContent).to.equal("example.com");
      expect(anchors[2].host, anchors[2].textContent).to.equal("www.example.com");
      expect(anchors[3].host, anchors[3].textContent).to.equal("www.expressen.se");
      expect(anchors[4].host, anchors[4].textContent).to.equal("www.expressen.se");
      expect(anchors[5].host, anchors[5].textContent).to.equal("www.expressen.se");
      expect(anchors[6].host, anchors[6].textContent).to.equal("localhost:30080");
    });

    it("get port returns href port", () => {
      expect(anchors[0].port, anchors[0].textContent).to.equal("");
      expect(anchors[1].port, anchors[1].textContent).to.equal("");
      expect(anchors[2].port, anchors[2].textContent).to.equal("");
      expect(anchors[3].port, anchors[3].textContent).to.equal("");
      expect(anchors[4].port, anchors[4].textContent).to.equal("");
      expect(anchors[5].port, anchors[5].textContent).to.equal("");
      expect(anchors[6].port, anchors[6].textContent).to.equal("30080");
    });

    it("get pathname returns href pathname", () => {
      expect(anchors[0].pathname, anchors[0].textContent).to.equal("/test");
      expect(anchors[1].pathname, anchors[1].textContent).to.equal("/");
      expect(anchors[2].pathname, anchors[2].textContent).to.equal("/");
      expect(anchors[3].pathname, anchors[3].textContent).to.equal("/slug/");
      expect(anchors[4].pathname, anchors[4].textContent).to.equal("/");
      expect(anchors[5].pathname, anchors[5].textContent).to.equal("/");
      expect(anchors[6].pathname, anchors[6].textContent).to.equal("/path");
    });

    it("get search returns search if any", () => {
      expect(anchors[0].search, anchors[0].textContent).to.equal("");
      expect(anchors[1].search, anchors[1].textContent).to.equal("");
      expect(anchors[2].search, anchors[2].textContent).to.equal("?w=1");
      expect(anchors[3].search, anchors[2].textContent).to.equal("");
      expect(anchors[4].search, anchors[4].textContent).to.equal("?signed_out=true");
    });

    it("get hash returns hash if any", () => {
      expect(anchors[0].hash, anchors[0].textContent).to.equal("");
      expect(anchors[1].hash, anchors[1].textContent).to.equal("");
      expect(anchors[2].hash, anchors[2].textContent).to.equal("");
      expect(anchors[3].hash, anchors[2].textContent).to.equal("");
      expect(anchors[4].hash, anchors[4].textContent).to.equal("");
      expect(anchors[5].hash, anchors[5].textContent).to.equal("#tag");
    });

    it("no href returns undefined", () => {
      expect(anchors[7].href, "href").to.be.undefined;
      expect(anchors[7].hostname, "hostname").to.be.undefined;
      expect(anchors[7].search, "search").to.be.undefined;
      expect(anchors[7].pathname, "pathname").to.be.undefined;
      expect(anchors[7].protocol, "protocol").to.be.undefined;
      expect(anchors[7].hash, "hash").to.be.undefined;
    });

    it("empty href returns page href", () => {
      expect(anchors[8]).to.have.property("href", "https://www.expressen.se/");
      expect(anchors[8]).to.have.property("hostname", "www.expressen.se");
      expect(anchors[8]).to.have.property("search", "");
      expect(anchors[8]).to.have.property("pathname", "/");
      expect(anchors[8]).to.have.property("protocol", "https:");
      expect(anchors[8]).to.have.property("hash", "");
    });
  });

  describe("mailto and tel", () => {
    let document, anchors;
    before("a DOM with anchors", () => {
      document = new Document({
        url: "https://www.expressen.se/",
        text: `
          <html>
            <body>
              <a href="mailto:jon.bananström@expressen.se">Mail</a>
              <a href="tel:+46700000000">Talk</a>
              <a href=" mailto:padded@expressen.se"> Mail</a>
            </body>
          </html>`,
      });

      anchors = document.getElementsByTagName("a");
    });

    it("mailto has the expected properties", () => {
      const a = anchors[0];
      expect(a).to.have.property("protocol", "mailto:");
      expect(a).to.have.property("host", "");
      expect(a).to.have.property("hostname", "");
      expect(a).to.have.property("pathname", "jon.bananström@expressen.se");
      expect(a).to.have.property("search", "");
      expect(a).to.have.property("href", "mailto:jon.bananström@expressen.se");
    });

    it("tel has the expected properties", () => {
      const a = anchors[1];
      expect(a).to.have.property("protocol", "tel:");
      expect(a).to.have.property("host", "");
      expect(a).to.have.property("hostname", "");
      expect(a).to.have.property("pathname", "+46700000000");
      expect(a).to.have.property("search", "");
      expect(a).to.have.property("href", "tel:+46700000000");
    });

    it("padded mailto has the expected properties", () => {
      const a = anchors[2];
      expect(a).to.have.property("protocol", "mailto:");
      expect(a).to.have.property("host", "");
      expect(a).to.have.property("hostname", "");
      expect(a).to.have.property("pathname", "padded@expressen.se");
      expect(a).to.have.property("search", "");
      expect(a).to.have.property("href", "mailto:padded@expressen.se");
    });
  });
});
