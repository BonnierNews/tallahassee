"use strict";

const {HTMLCollection} = require("../lib/HTMLCollection");
const {Document} = require("../lib");

describe("HTMLCollection", () => {
  let document;
  beforeEach(() => {
    document = Document({
      text: `
        <html>
          <body>
            <div class="row"></div>
            <div class="row row--boat">
              <span class="row--boat">Wide</span>
            </div>
            <div class="row row--boat">
              <p>Paragraph</p>
            </div>
          </body>
        </html>`
    });
  });

  it("removes element from list if member attribute change that mathed selector", () => {
    const elements = new HTMLCollection(document.body, ".row.row--boat");
    expect(elements.length).to.equal(2);

    elements[0].className = "row";

    expect(elements.length).to.equal(1);
  });

  it("removes element from list if node is deleted", () => {
    const elements = new HTMLCollection(document.body, ".row.row--boat");
    expect(elements.length).to.equal(2);
    document.body.removeChild(elements[0]);
    expect(elements.length).to.equal(1);
  });

  it("can handle document.documentElement as well as element", () => {
    const elements = new HTMLCollection(document.documentElement, ".row.row--boat");
    expect(elements.length).to.equal(2);

    elements[0].className = "row";

    expect(elements.length).to.equal(1);
  });

  it("removes element from list if node is deleted", () => {
    const elements = new HTMLCollection(document.body, ".row.row--boat");
    expect(elements.length).to.equal(2);
    document.body.removeChild(elements[0]);
    expect(elements.length).to.equal(1);
  });

  it("result is not an Array", () => {
    const elements = new HTMLCollection(document.body, ".row.row--boat");
    expect(elements.length).to.equal(2);

    expect(Array.isArray(elements)).to.be.false;

    expect(elements.map).to.not.be.ok;
    expect(elements.forEach).to.not.be.ok;
    expect(elements[0]).to.be.ok;
  });

  it("result can be casted to Array", () => {
    const elements = new HTMLCollection(document.body, ".row.row--boat");
    expect(elements.length).to.equal(2);
    expect(Array.prototype.slice.call(elements)).to.have.length(2);
  });

  it("result has own keys representing index as strings", () => {
    const elements = new HTMLCollection(document.body, ".row.row--boat");
    expect(elements.length).to.equal(2);
    expect(Object.getOwnPropertyNames(elements)).to.eql(["0", "1"]);
  });

  it("result can be for looped", () => {
    const elements = new HTMLCollection(document.body, "div", {attributes: false});
    expect(elements.length).to.equal(3);

    const tags = [];

    for (let i = 0; i < elements.length; i++) {
      tags.push(elements[i].tagName);
    }

    expect(tags).to.eql(["DIV", "DIV", "DIV"]);
  });

  it("result can be for-of looped", () => {
    const elements = new HTMLCollection(document.body, "div", {attributes: false});
    expect(elements.length).to.equal(3);

    const tags = [];

    for (const elm of elements) {
      tags.push(elm.tagName);
    }

    expect(tags).to.eql(["DIV", "DIV", "DIV"]);
  });

  it("result can be for-in looped", () => {
    const elements = new HTMLCollection(document.body, "div", {attributes: false});
    expect(elements.length).to.equal(3);

    const tags = [];

    for (const key in elements) {
      tags.push(key);
    }

    expect(tags).to.eql(["0", "1", "2", "length", "item", "namedItem"]);
  });
});
