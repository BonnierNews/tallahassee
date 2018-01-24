"use strict";

const app = require("../app/app");
const Browser = require("../");
const {Compiler, IntersectionObserver} = require("../lib");

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

    browser.window.scroll(0, 50);

    expect(img1.getBoundingClientRect()).to.have.property("top", 50);
    expect(img2.getBoundingClientRect()).to.have.property("top", 150);
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

      browser.scrollToTopOfElement(img1, -1);

      expect(img1.getBoundingClientRect()).to.have.property("top", -1);
      expect(img2.getBoundingClientRect()).to.have.property("top", 99);
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

      browser.scrollToBottomOfElement(img1, -browser.window.innerHeight);

      expect(img1.getBoundingClientRect()).to.have.property("top", -20);
      expect(img2.getBoundingClientRect()).to.have.property("top", 180);
    });
  });

  describe("stickElementToTop()", () => {
    it("sets top of element to 0", async () => {
      const browser = await Browser(app).navigateTo("/");

      browser.setElementsToScroll((document) => {
        return document.getElementsByTagName("img");
      });

      const elements = browser.document.getElementsByTagName("img");
      const [img1, img2] = elements;
      img1._setBoundingClientRect(700, 720);
      img2._setBoundingClientRect(900, 920);

      browser.stickElementToTop(img1);

      expect(img1.getBoundingClientRect()).to.have.property("top", 0);
      expect(img2.getBoundingClientRect()).to.have.property("top", 900);

      browser.unstickElementFromTop(img1);

      expect(img1.getBoundingClientRect()).to.have.property("top", 700);
      expect(img2.getBoundingClientRect()).to.have.property("top", 900);
    });

    it("unstickElementFromTop() resets top in regard to scroll", async () => {
      const browser = await Browser(app).navigateTo("/");

      browser.setElementsToScroll((document) => {
        return document.getElementsByTagName("img");
      });

      const elements = browser.document.getElementsByTagName("img");
      const [img1, img2] = elements;
      img1._setBoundingClientRect(700, 720);
      img2._setBoundingClientRect(900, 920);

      browser.stickElementToTop(img1);

      browser.window.scroll(0, 100);

      expect(img1.getBoundingClientRect()).to.have.property("top", 0);
      expect(img2.getBoundingClientRect()).to.have.property("top", 800);

      browser.unstickElementFromTop(img1);

      expect(img1.getBoundingClientRect()).to.have.property("top", 600);
      expect(img2.getBoundingClientRect()).to.have.property("top", 800);
    });
  });

  describe("use with IntersectionObserver", () => {
    it("listens to window scroll", async () => {
      const browser = await Browser(app).navigateTo("/");
      browser.window.IntersectionObserver = IntersectionObserver(browser);

      browser.setElementsToScroll((document) => {
        return document.getElementsByTagName("img");
      });

      const [lazyLoaded] = browser.document.getElementsByClassName("lazy-load");
      lazyLoaded._setBoundingClientRect(300);

      require("../app/assets/scripts/main");

      browser.scrollToTopOfElement(lazyLoaded);

      expect(lazyLoaded.classList.contains("lazy-load")).to.be.false;
    });
  });
});
