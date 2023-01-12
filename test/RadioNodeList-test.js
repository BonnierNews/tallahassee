"use strict";

const {Document} = require("../lib");

describe("RadioNodeList", () => {
  let document;
  beforeEach(() => {
    document = new Document({
      text: `
        <html>
          <body>
            <form>
              <input type="checkbox" name="agree" checked>
              <input type="radio" name="choosewisely" value="1">
              <input type="radio" name="choosewisely" value="2" checked="checked">
              <input type="radio" name="choosewisely" value="3">
            </form>
          </body>
        </html>`
    });
  });

  it("form should hold the RadioNodeList by name", () => {
    expect(document.forms[0].elements.choosewisely).to.be.ok;
  });

  it("should have the same length as there are radio buttons", () => {
    const list = document.forms[0].elements.choosewisely;
    expect(list.length).to.equal(3);
  });

  it("removes element from list if node is deleted", () => {
    const list = document.forms[0].elements.choosewisely;
    expect(list.length).to.equal(3);
    document.forms[0].removeChild(list[0]);
    expect(list.length).to.equal(2);
  });

  it("holds value of the selected radio button", () => {
    const list = document.forms[0].elements.choosewisely;
    expect(list.value).to.equal("2");

    list[0].checked = true;
    expect(list.value).to.equal("1");

    list[2].checked = true;
    expect(list.value).to.equal("3");
  });

  it("holds no value if no checked radio button", () => {
    const form = document.forms[0];
    const list = form.elements.choosewisely;
    list[0].checked = false;
    list[1].checked = false;
    list[2].checked = false;
    expect(list.value).to.equal("");
  });

  it("toString() includes class name", () => {
    const list = document.forms[0].elements.choosewisely;
    expect(list.toString()).to.equal("[object RadioNodeList]");
  });
});
