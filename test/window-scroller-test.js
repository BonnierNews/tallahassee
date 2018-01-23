"use strict";

const app = require("../app/app");
const Browser = require("../");
const {Compiler} = require("../lib");

describe("Window scroller", () => {
  before(() => {
    Compiler.Compiler([/assets\/scripts/]);
  });

  it("observes and sets top of elements passed to stacked elements function", async () => {
    const browser = await Browser(app).navigateTo("/");

    browser.setElementsToScroll((document) => {
      return document.getElementsByTagName("img");
    });

    const elements = browser.document.getElementsByTagName("img");
    const [img1, img2] = elements;
    img1._setBoundingClientRect(100, 120);
    img2._setBoundingClientRect(200, 220);

    browser.window.scroll(0, 100);

    expect(img1.getBoundingClientRect()).to.have.property("top", 0);
    expect(img2.getBoundingClientRect()).to.have.property("top", 100);

    browser.window.scroll(0, 200);

    expect(img1.getBoundingClientRect()).to.have.property("top", -100);
    expect(img2.getBoundingClientRect()).to.have.property("top", 0);
  });

  describe("scrollToTopOfElement()", () => {
    it("scrolls to top of element", async () => {
      const browser = await Browser(app).navigateTo("/");

      browser.setElementsToScroll((document) => {
        return document.getElementsByTagName("img");
      });

      const elements = browser.document.getElementsByTagName("img");
      const [img1, img2] = elements;
      img1._setBoundingClientRect(100, 120);
      img2._setBoundingClientRect(200, 220);

      browser.scrollToTopOfElement(img1);

      expect(img1.getBoundingClientRect()).to.have.property("top", 0);
      expect(img2.getBoundingClientRect()).to.have.property("top", 100);

      browser.scrollToTopOfElement(img2);

      expect(img1.getBoundingClientRect()).to.have.property("top", -100);
      expect(img2.getBoundingClientRect()).to.have.property("top", 0);
    });

    it("with offset set top to offset", async () => {
      const browser = await Browser(app).navigateTo("/");

      browser.setElementsToScroll((document) => {
        return document.getElementsByTagName("img");
      });

      const elements = browser.document.getElementsByTagName("img");
      const [img1, img2] = elements;
      img1._setBoundingClientRect(100, 120);
      img2._setBoundingClientRect(200, 220);

      browser.scrollToTopOfElement(img1, -10);

      expect(img1.getBoundingClientRect()).to.have.property("top", -10);
      expect(img2.getBoundingClientRect()).to.have.property("top", 90);

      browser.scrollToTopOfElement(img2, 10);

      expect(img1.getBoundingClientRect()).to.have.property("top", -90);
      expect(img2.getBoundingClientRect()).to.have.property("top", 10);
    });
  });

  describe("scrollToBottomOfElement()", () => {
    it("sets bottom of element to window.innerHeight", async () => {
      const browser = await Browser(app).navigateTo("/");
      browser.window.innerHeight = 600;

      browser.setElementsToScroll((document) => {
        return document.getElementsByTagName("img");
      });

      const elements = browser.document.getElementsByTagName("img");
      const [img1, img2] = elements;
      img1._setBoundingClientRect(700, 720);
      img2._setBoundingClientRect(900, 920);

      browser.scrollToBottomOfElement(img1);

      expect(img1.getBoundingClientRect()).to.have.property("top", 580);
      expect(img2.getBoundingClientRect()).to.have.property("top", 780);

      browser.scrollToBottomOfElement(img2);

      expect(img1.getBoundingClientRect()).to.have.property("top", 380);
      expect(img2.getBoundingClientRect()).to.have.property("top", 580);
    });

    it("with offset includes offset from bottom", async () => {
      const browser = await Browser(app).navigateTo("/");
      browser.window.innerHeight = 600;

      browser.setElementsToScroll((document) => {
        return document.getElementsByTagName("img");
      });

      const elements = browser.document.getElementsByTagName("img");
      const [img1, img2] = elements;
      img1._setBoundingClientRect(700, 720);
      img2._setBoundingClientRect(900, 920);

      browser.scrollToBottomOfElement(img1, -10);

      expect(img1.getBoundingClientRect()).to.have.property("top", 570);
      expect(img2.getBoundingClientRect()).to.have.property("top", 770);

      browser.scrollToBottomOfElement(img2, 10);

      expect(img1.getBoundingClientRect()).to.have.property("top", 390);
      expect(img2.getBoundingClientRect()).to.have.property("top", 590);
    });
  });
});
