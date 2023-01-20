"use strict";

const {Document} = require("../lib");

describe("HTMLElement", () => {
  let document;
  beforeEach(() => {
    document = new Document({
      text: `
        <html>
          <body>
            <div data-test-get="should be fetched"></div>
            <span data-json="{&quot;var&quot;:1}">åäö</span>
            <div contenteditable data-test="foo"></div>
          </body>
        </html>`
    });
  });

  it("can read contentEditable property", () => {
    const divs = document.getElementsByTagName("div");
    expect(divs[0].contentEditable).to.equal(false);
    expect(divs[1].contentEditable).to.equal(true);
  });

  it("should get the dataset attribute", () => {
    const [elm] = document.getElementsByTagName("div");
    expect(elm.dataset).to.eql({
      testGet: "should be fetched"
    });
    expect(elm.dataset.testGet).to.equal("should be fetched");
    expect(elm.dataset["testGet"]).to.equal("should be fetched"); // eslint-disable-line dot-notation
  });

  it("should set a dataset attribute", () => {
    const [elm] = document.getElementsByTagName("div");
    elm.dataset.testSetObjectLike = "bar";
    elm.dataset["testSetArrayLike"] = "baz"; // eslint-disable-line dot-notation
    expect(elm.$elm[0].attribs).to.have.property("data-test-set-object-like", "bar");
    expect(elm.dataset.testSetObjectLike).to.equal("bar");
    expect(elm.$elm[0].attribs).to.have.property("data-test-set-array-like", "baz");
    expect(elm.dataset["testSetArrayLike"]).to.equal("baz"); // eslint-disable-line dot-notation
  });

  it("should delete a dataset attribute", () => {
    const [elm] = document.getElementsByTagName("div");
    expect(delete elm.dataset.testGet).to.be.true;
    expect(elm.dataset).to.not.have.property("testGet");
    expect(elm.$elm[0].attribs).to.not.have.property("data-test-get");
    expect(delete elm.dataset.testGet).to.be.true;
  });

  it("returns new attribute set by setAttribute", () => {
    const [elm] = document.getElementsByTagName("div");
    elm.setAttribute("data-test-set-attribute", 1);

    expect(elm.dataset).to.eql({
      testGet: "should be fetched",
      testSetAttribute: "1"
    });
  });

  it("returns attribute with encoded json", () => {
    const [elm] = document.getElementsByTagName("span");
    expect(elm.dataset.json).to.equal("{\"var\":1}");
  });
});
