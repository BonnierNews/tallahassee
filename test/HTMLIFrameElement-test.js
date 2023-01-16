"use strict";

const {Document} = require("../lib");

describe("HTMLIframeElement", () => {
  let document;
  beforeEach(() => {
    document = new Document({
      text: `
        <html>
          <body>
            <iframe class="test-src" src="/slug/">Relative frame</iframe>
          </body>
        </html>`
    });
  });

  it("can read contentWindow property", () => {
    const [iframe] = document.getElementsByTagName("iframe");
    expect(iframe.contentWindow).to.equal(document.defaultView);
  });
});
