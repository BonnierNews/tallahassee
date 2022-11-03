"use strict";

const {Document} = require("../lib");

describe("HTMLTextAreaElement", () => {
  let document;
  beforeEach(() => {
    document = new Document({
      text: `
        <html>
          <body>
            <form>
              <textarea name="novel"></textarea>
            </form>
          </body>
        </html>`
    });
  });

  it("innerText is empty if value is set", () => {
    const elm = document.forms[0].novel;
    elm.value = "a";
    expect(elm.innerText).to.equal("");
  });
});
