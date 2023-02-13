import { Window, Document } from "../lib/index.js";
import HTMLImageElement from "../lib/HTMLImageElement.js";

describe("Image", () => {
  let document, window;
  beforeEach(() => {
    document = new Document(`
        <!DOCTYPE html>
        <html>
          <body>
          </body>
        </html>
    `);
    window = new Window("", {
      get document() {
        return document;
      },
    });
  });

  it("can create a new image", () => {
    const image = new window.Image(100, 200);

    expect(image).to.be.instanceOf(HTMLImageElement);
  });

  it("can be appended into body", () => {
    const image = new window.Image(100, 200);

    document.body.appendChild(image);
    expect(document.getElementsByTagName("img")[0]).to.exist;
  });

  it("has a width and height", () => {
    const image = new window.Image(100, 200);

    expect(image.width).to.equal(100);
    expect(image.height).to.equal(200);
  });
});
