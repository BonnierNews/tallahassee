"use strict";

const {HTMLCollectionFactory} = require("../lib/HTMLCollection");
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
    const elements = HTMLCollectionFactory(document.body, ".row.row--boat");
    expect(elements.length).to.equal(2);

    elements[0].className = "row";

    expect(elements.length).to.equal(1);
  });

  it("removes element from list if node is deleted", () => {
    const elements = HTMLCollectionFactory(document.body, ".row.row--boat");
    expect(elements.length).to.equal(2);
    document.body.removeChild(elements[0]);
    expect(elements.length).to.equal(1);
  });

  it("passes options to underlying MutationObserver, but ignores childList", () => {
    const elementsC = HTMLCollectionFactory(document.body, "div", {childList: true});
    expect(elementsC.length).to.equal(3);
    elementsC[0].className = "row";
    expect(elementsC.length).to.equal(3);

    document.body.removeChild(elementsC[0]);
    expect(elementsC.length).to.equal(2);

    const elementsE = HTMLCollectionFactory(document.body, "div", {childList: false});
    expect(elementsE.length).to.equal(2);
    elementsE[0].className = "row";

    document.body.removeChild(elementsC[0]);

    expect(elementsE.length).to.equal(1);
  });

  it("result is not an Array", () => {
    const elements = HTMLCollectionFactory(document.body, ".row.row--boat");
    expect(elements.length).to.equal(2);

    expect(Array.isArray(elements)).to.be.false;

    expect(elements.map).to.not.be.ok;
    expect(elements.forEach).to.not.be.ok;
    expect(elements[0]).to.be.ok;
  });

  it("result can be casted to Array", () => {
    const elements = HTMLCollectionFactory(document.body, ".row.row--boat");
    expect(elements.length).to.equal(2);
    expect(Array.prototype.slice.call(elements)).to.have.length(2);
  });

  it("result can be for looped", () => {
    const elements = HTMLCollectionFactory(document.body, "div", {attributes: false});
    expect(elements.length).to.equal(3);

    const tags = [];

    for (let i = 0; i < elements.length; i++) {
      tags.push(elements[i].tagName);
    }

    expect(tags).to.eql(["DIV", "DIV", "DIV"]);
  });
});
