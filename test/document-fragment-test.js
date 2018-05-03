"use strict";

const Document = require("../lib/Document");
const DocumentFragment = require("../lib/DocumentFragment");
const Element = require("../lib/Element");

describe("DocumentFragment", () => {
  let documentFragment;
  beforeEach(() => {
    documentFragment = DocumentFragment(Element);
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

  describe(".querySelector()", () => {
    it("returns all matching elements", () => {
      const children = documentFragment.querySelectorAll("*");
      expect(children).to.have.length(2);
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
      const child = Document({text: ""}).createElement("li");
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
});
