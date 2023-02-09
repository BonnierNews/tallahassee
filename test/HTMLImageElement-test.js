import {Document} from "../lib/index.js";

describe("HTMLImageElement", () => {
  let document;
  beforeEach(() => {
    document = new Document({
      text: `
        <html>
          <body>
            <img src="blahonga.jpg" 
                 alt="Blahonga" 
                 srcset="header640.png 640w, header960.png 960w"
                 width="100"
                 height="200">
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
    expect(img.alt).to.equal("Hoppsan");
  });

  it("can read srcset property", () => {
    const [img] = document.getElementsByTagName("img");
    expect(img.srcset).to.equal("header640.png 640w, header960.png 960w");
  });

  it("can set srcset property", () => {
    const [img] = document.getElementsByTagName("img");
    expect(img.srcset = "header320.png 320w, header480.png 480w").to.equal("header320.png 320w, header480.png 480w");
    expect(img.srcset).to.equal("header320.png 320w, header480.png 480w");
  });

  it("can read width property", () => {
    const [img] = document.getElementsByTagName("img");
    expect(img.width).to.equal(100);
  });

  it("can read height property", () => {
    const [img] = document.getElementsByTagName("img");
    expect(img.height).to.equal(200);
  });
});
