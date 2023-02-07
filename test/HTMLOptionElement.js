"use strict";

const {Document} = require("../lib");

describe("HTMLOptionElement", () => {
  it("doesn't bubble event when there is no parent", () => {
    const document = new Document({
      text: `
        <html>
          <body>
          </body>
        </html>`
    });
    const option = document.createElement("option");
    option.selected = true;
  });
});
