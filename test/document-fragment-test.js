"use strict";

const Document = require("../lib/Document");
const DocumentFragment = require("../lib/DocumentFragment");

describe("DocumentFragment", () => {
  let documentFragment;
  beforeEach(() => {
    documentFragment = new DocumentFragment(new Document({}));
    documentFragment.$elm.html(`
      <li><a>Item</a></li>
    `);
  });

  describe(".querySelector()", () => {
    it("returns one matching element", () => {
      const child = documentFragment.querySelector("*");
      expect(child).to.be.ok;
      expect(child).to.have.property("tagName", "LI");
    });

    it("returns null if selector doesn't match any children", () => {
      const child = documentFragment.querySelector("h1");
      expect(child).to.be.null;
    });
  });

  describe(".querySelectorAll()", () => {
    it("returns all matching elements", () => {
      const children = documentFragment.querySelectorAll("*");
      expect(children.length).to.equal(2);
      expect(children[0]).to.have.property("tagName", "LI");
      expect(children[1]).to.have.property("tagName", "A");
    });

    it("returns empty array if selector doesn't match any children", () => {
      const children = documentFragment.querySelectorAll("h1");
      expect(children).to.have.length(0);
    });
  });

  describe(".appendChild()", () => {
    it("appends a new child", () => {
      const child = new Document({text: ""}).createElement("li");
      documentFragment.appendChild(child);
      const children = documentFragment.querySelectorAll("li");
      expect(children).to.have.length(2);
    });

    it("appends an existing child", () => {
      const child = documentFragment.querySelector("a");
      documentFragment.appendChild(child);
      const children = documentFragment.querySelectorAll("*");
      expect(children).to.have.length(2);
      expect(children[1].previousElementSibling).to.have.property("tagName", "LI");
    });
  });

  describe(".firstChild", () => {
    it("returns first child if element", () => {
      const fragment = new DocumentFragment(new Document({}));
      fragment.$elm.html("<li><a>Item</a></li>");

      const firstChild = fragment.firstChild;

      expect(firstChild).to.be.ok;
      expect(firstChild.nodeType).to.equal(1);
      expect(firstChild.tagName).to.equal("LI");
    });

    it("returns first child if text", () => {
      const fragment = new DocumentFragment(new Document({}));
      fragment.$elm.html("Memememe<li><a>Item</a></li>");

      const firstChild = fragment.firstChild;

      expect(firstChild).to.be.ok;
      expect(firstChild.nodeType).to.equal(3);
    });

    it("returns null if no children", () => {
      const fragment = new DocumentFragment(new Document({}));
      fragment.$elm.html("");

      expect(fragment.firstChild).to.be.null;
    });
  });

  describe(".firstElementChild", () => {
    it("returns first child element", () => {
      const fragment = new DocumentFragment(new Document({}));
      fragment.$elm.html("<li><a>Item</a></li>");

      const firstChild = fragment.firstElementChild;

      expect(firstChild).to.be.ok;
      expect(firstChild.nodeType).to.equal(1);
      expect(firstChild.tagName).to.equal("LI");
    });

    it("returns first element child if first child is text", () => {
      const fragment = new DocumentFragment(new Document({}));
      fragment.$elm.html("Memememe<li><a>Item</a></li>");

      const firstChild = fragment.firstElementChild;

      expect(firstChild).to.be.ok;
      expect(firstChild.nodeType).to.equal(1);
      expect(firstChild.tagName).to.equal("LI");
    });

    it("returns null if no children", () => {
      const fragment = new DocumentFragment(new Document({}));
      fragment.$elm.html("Mememem");

      expect(fragment.firstElementChild).to.be.null;
    });
  });

  describe(".lastElementChild", () => {
    it("returns first child element", () => {
      const fragment = new DocumentFragment(new Document({}));
      fragment.$elm.html("<p>data</p><li><a>Item</a></li>Mememe");

      const lastElmChild = fragment.lastElementChild;

      expect(lastElmChild).to.be.ok;
      expect(lastElmChild.nodeType).to.equal(1);
      expect(lastElmChild.tagName).to.equal("LI");
    });

    it("returns first element child if first child is text", () => {
      const fragment = new DocumentFragment(new Document({}));
      fragment.$elm.html("<li><a>Item</a></li>Memememe");

      const lastElmChild = fragment.lastElementChild;

      expect(lastElmChild).to.be.ok;
      expect(lastElmChild.nodeType).to.equal(1);
      expect(lastElmChild.tagName).to.equal("LI");
    });

    it("returns null if no children", () => {
      const fragment = new DocumentFragment(new Document({}));
      fragment.$elm.html("Mememem");

      expect(fragment.lastElementChild).to.be.null;
    });
  });

  describe(".childNodes", () => {
    it("returns child nodes", () => {
      const fragment = new DocumentFragment(new Document({}));
      fragment.$elm.html("Mememem<li><a>Item</a></li>");

      const childNodes = fragment.childNodes;

      expect(childNodes).to.be.ok;
      expect(childNodes.length).to.equal(2);
      expect(childNodes[0].nodeType).to.equal(3);
      expect(childNodes[1].nodeType).to.equal(1);
    });

    it("child childNodes also returns children", () => {
      const fragment = new DocumentFragment(new Document({}));
      fragment.$elm.html("<li><a>Item</a></li>");

      const childNode = fragment.childNodes[0];

      expect(childNode.childNodes).to.be.ok;
      expect(childNode.childNodes.length).to.equal(1);
      expect(childNode.childNodes[0].tagName).to.equal("A");
    });

    it("returns empty if no children", () => {
      const fragment = new DocumentFragment(new Document({}));
      fragment.$elm.html("");

      expect(fragment.childNodes).to.be.empty;
    });
  });

  describe("getElementById", () => {
    it("returns element", () => {
      const fragment = new DocumentFragment(new Document({}));
      fragment.$elm.html("Mememem<li><a id=\"anchor\">Item</a></li>");

      const elm = fragment.getElementById("anchor");

      expect(elm).to.be.ok;
    });

    it("returns null if not found", () => {
      const fragment = new DocumentFragment(new Document({}));
      fragment.$elm.html("<li><a id=\"anchor\">Item</a></li>");

      const elm = fragment.getElementById("ankare");

      expect(elm).to.be.null;
    });
  });
});
