import {Document} from "../lib/index.js";

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
    const elm = document.forms[0].elements.novel;
    elm.value = "a";
    expect(elm.textContent).to.equal("");
  });
});
