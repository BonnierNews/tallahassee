"use strict";

const {Document} = require("../lib");

describe("HTMLImageElement", () => {
  let document;
  beforeEach(() => {
    document = new Document({
      text: `
        <html>
          <body>
            <img src="blahonga.jpg" alt="Blahonga">
          </body>
        </html>`
    });
  });

  it("can read alt property", () => {
    const [img] = document.getElementsByTagName("img");
    expect(img.alt).to.equal("Blahonga");
  });

  it("can set alt property", () => {
    const [img] = document.getElementsByTagName("img");
    expect(img.alt = "Hoppsan").to.equal("Hoppsan");
  });
});
