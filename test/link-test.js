import { Document } from "../lib/index.js";

describe("Link", () => {
  let document, links;
  beforeEach("a DOM with links", () => {
    document = new Document({
      url: "https://www.expressen.se/",
      text: `
        <html>
        <head>
          <link href="/style.css">
          <link href="//bootstrap.local/style.css">
          <link>
        </head>
        <body></body>
      </html>`,
    });

    links = document.getElementsByTagName("link");
  });

  describe("Link properties", () => {
    it("href returns expected value", () => {
      expect(links[0].href, "relative href").to.equal("https://www.expressen.se/style.css");
      expect(links[1].href, "no protocol").to.equal("https://bootstrap.local/style.css");
      expect(links[2].href, "not defined").to.equal("");
    });
  });
});
