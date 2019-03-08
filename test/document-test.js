"use strict";

const DocumentFragment = require("../lib/DocumentFragment");
const {Document} = require("../lib");
const {CookieJar} = require("cookiejar");

describe("Document", () => {
  let document;
  beforeEach(() => {
    const jar = CookieJar();
    jar.setCookies("_ga=1");
    document = Document({
      request: {
        header: {
          referer: "referer.url"
        },
        url: "https://www.expressen.se/nyheter/article-slug/"
      },
      text: `
        <html>
          <body>
            <h2 id="headline">Test</h2>
            <input type="button"
            <script>var a = 1;</script>
            <template id="schablon" data-json="{&quot;json&quot;:&quot;&#xE5;&#xE4;&#xF6; in top document child&quot;}">
              <div id="insert" data-json="{&quot;json&quot;:&quot;&#xE5;&#xE4;&#xF6; in sub document child&quot;}">
                <p>In a template</p>
              </div>
            </template>
            <div id="lazy"></div>
            <form>
              <input name="input1">
              <input name="input2">
              <button id="input2">CTA</button>
            </form>
          </body>
        </html>`
    }, jar);
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
  });

  describe("createDocumentFragment()", () => {
    it("returns a document fragment", () => {
      const fragment = document.createDocumentFragment();
      expect(fragment).to.be.ok;
      expect(fragment).to.be.instanceof(DocumentFragment);
    });
  });

  describe("importNode()", () => {
    it("importNode() returns clone of element without content", () => {
      const elm = document.getElementById("headline");
      const elmClone = document.importNode(elm);
      expect(elmClone.outerHTML).to.equal("<h2 id=\"headline\"></h2>");
      expect(elm.outerHTML === elmClone.outerHTML).to.be.false;
      expect(elm === elmClone).to.be.false;
    });

    it("importNode() with deep parameter returns clone of element with content", () => {
      const elm = document.getElementById("headline");
      const elmClone = document.importNode(elm, true);
      expect(elmClone.outerHTML).to.equal("<h2 id=\"headline\">Test</h2>");
      expect(elm.outerHTML === elmClone.outerHTML).to.be.true;
      expect(elm === elmClone).to.be.false;
    });

    it("importNode() on templateElement.content combined with appendChild() inserts element content", async () => {
      const templateElement = document.getElementById("schablon");
      const templateContentClone = document.importNode(templateElement.content, true);

      expect(document.getElementById("insert")).not.to.be.ok;

      document.getElementById("lazy").appendChild(templateContentClone);

      expect(document.getElementById("insert")).to.be.ok;
      expect(document.getElementById("insert").parentElement.id).to.equal("lazy");
    });

    it("handles JSON in attributes in sub documents", () => {
      const templateElement = document.getElementById("schablon");
      const templateContentClone = document.importNode(templateElement.content, true);

      const lazyContainer = document.getElementById("lazy");
      lazyContainer.appendChild(templateContentClone);

      const subDocChildInTopDoc = lazyContainer.lastElementChild;

      expect(document.getElementById("insert")).to.be.ok;

      const topDocJSON = JSON.parse(templateElement.dataset.json);
      expect(topDocJSON).to.deep.equal({"json": "åäö in top document child"});
      const subDocInTopDocJSON = JSON.parse(subDocChildInTopDoc.dataset.json);
      expect(subDocInTopDocJSON).to.deep.equal({"json": "åäö in sub document child"});
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

  describe("createElementNS", () => {
    it("returns an element", () => {
      const element = document.createElementNS("http://www.expressen.se/1999/xhtml", "div");
      expect(element.tagName).to.equal("DIV");
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
      expect(document.cookie).to.equal("_ga=1;_new=2");
    });

    it("overwrites cookie with same name", () => {
      document.cookie = "_writable=2";
      document.cookie = "_writable=3";
      expect(document.cookie).to.equal("_ga=1;_writable=3");
    });

    it("does not URI encodes when setting value", () => {
      document.cookie = "_writable=2 3";
      expect(document.cookie).to.equal("_ga=1;_writable=2 3");
    });

    it("can set cookie value to blank", () => {
      document.cookie = "_writable=4";
      expect(document.cookie).to.equal("_ga=1;_writable=4");

      document.cookie = "_writable=";
      expect(document.cookie).to.equal("_ga=1;_writable=");

      document.cookie = "_writable=44 ";
      expect(document.cookie).to.equal("_ga=1;_writable=44 ");
    });

    it("can set cookie with expires", () => {
      document.cookie = "termsAware=1;path=/;domain=.expressen.se;expires=Wed, 20 Sep 2028 08:38:44 GMT";
      expect(document.cookie).to.equal("_ga=1;termsAware=1");
    });
  });

  describe("referrer", () => {
    it("has referer", () => {
      expect(document.referrer).to.be.ok;
    });

    it("has a url", () => {
      expect(document.referrer).to.equal("referer.url");
    });
  });

  describe("nodeType", () => {
    it("should return the correct node type", () => {
      expect(document.nodeType).to.equal(9);
    });
  });

  describe("fullscreenElement", () => {
    it("should be null when not in fullscreen", () => {
      expect(document.fullscreenElement).to.equal(null);
    });

    it("should emit a fullscreenchange event", () => {
      let calledCB = false;

      document.addEventListener("fullscreenchange", () => {
        calledCB = true;
      });

      const headline = document.getElementById("headline");
      headline.requestFullscreen();
      expect(calledCB).to.equal(true);
    });

    it("should be set to target element when in fullscreen mode", () => {
      const headline = document.getElementById("headline");
      headline.requestFullscreen();
      expect(document.fullscreenElement).to.eql(headline);
    });

    it("should return if document.fullscreenElement is not null and does not equal target element", () => {
      const headline = document.getElementById("headline");
      headline.requestFullscreen();
      expect(document.fullscreenElement).to.eql(headline);

      const schablon = document.getElementById("schablon");
      schablon.requestFullscreen();
      expect(document.fullscreenElement).to.eql(headline);
    });
  });

  describe("exitFullscreen", () => {
    it("should set document.fullscreenElement to null", () => {
      const headline = document.getElementById("headline");
      headline.requestFullscreen();
      expect(document.fullscreenElement).to.eql(headline);

      document.exitFullscreen();
      expect(document.fullscreenElement).to.equal(null);
    });

    it("should emit a fullscreenchange event", () => {
      const headline = document.getElementById("headline");
      headline.requestFullscreen();
      expect(document.fullscreenElement).to.eql(headline);


      let calledCB = false;
      document.addEventListener("fullscreenchange", () => {
        calledCB = true;
      });
      document.exitFullscreen();
      expect(document.fullscreenElement).to.eql(null);
      expect(calledCB).to.equal(true);
    });

    it("should return if called when not in fullscreen", () => {
      let calledCB = false;
      document.addEventListener("fullscreenchange", () => {
        calledCB = true;
      });

      document.exitFullscreen();
      expect(document.fullscreenElement).to.eql(null);
      expect(calledCB).to.equal(false);
    });
  });

  describe("getElementsByName", () => {
    it("returns elements with name", () => {
      const elements = document.getElementsByName("input1");
      expect(elements.length).to.equal(1);
      expect(elements[0].tagName).to.equal("INPUT");
    });

    it("also returns elements with the same id to mimic <= IE10 behaviour", () => {
      const elements = document.getElementsByName("input2");
      expect(elements.length).to.equal(2);
      expect(elements[0].tagName).to.equal("INPUT");
      expect(elements[1].tagName).to.equal("BUTTON");
    });
  });
});
