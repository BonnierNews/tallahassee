"use strict";

const { Document, Window } = require("../lib/index.js");

describe("HTMLIframeElement", () => {
  let document;
  beforeEach(() => {
    const window = new Window("", {
      get document() {
        return document;
      },
    });
    document = new Document({
      text: `
        <html>
          <body>
            <iframe class="test-src" src="/slug/">Relative frame</iframe>
          </body>
        </html>`,
    }, null, window);
  });

  it("can read contentDocument property", () => {
    const [ iframe ] = document.getElementsByTagName("iframe");
    expect(iframe.contentDocument).to.equal(document);
  });

  it("can read contentWindow property", () => {
    const [ iframe ] = document.getElementsByTagName("iframe");
    expect(iframe.contentWindow).to.equal(document.defaultView);
  });
});
