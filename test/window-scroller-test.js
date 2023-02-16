"use strict";

const Script = require("@bonniernews/wichita");
const path = require("path");

const { app } = require("../app/app.js");
const Browser = require("../index.js");
const { IntersectionObserver: fakeIntersectionObserver } = require("../lib/index.js");

describe("Window scroller", () => {
  it("observes and sets top of elements passed to stacked elements function", async () => {
    const browser = await new Browser(app).navigateTo("/");

    browser.setElementsToScroll((document) => {
      return document.getElementsByTagName("img");
    });

    const elements = browser.document.getElementsByTagName("img");
    const img1 = elements[0];
    const img2 = elements[1];
    img1._setBoundingClientRect({
      top: 100,
      bottom: 120,
    });
    img2._setBoundingClientRect({
      top: 200,
      bottom: 220,
    });

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

  it("observes and sets left of elements passed to stacked elements function", async () => {
    const browser = await new Browser(app).navigateTo("/");

    browser.setElementsToScroll((document) => {
      return document.getElementsByTagName("img");
    });

    const elements = browser.document.getElementsByTagName("img");
    const img1 = elements[0];
    const img2 = elements[1];
    img1._setBoundingClientRect({
      left: 100,
      right: 120,
    });
    img2._setBoundingClientRect({
      left: 200,
      right: 220,
    });

    browser.window.scroll(100, 0);

    expect(img1.getBoundingClientRect()).to.have.property("left", 0);
    expect(img1.getBoundingClientRect()).to.have.property("right", 20);

    expect(img2.getBoundingClientRect()).to.have.property("left", 100);
    expect(img2.getBoundingClientRect()).to.have.property("right", 120);

    browser.window.scroll(200, 0);

    expect(img1.getBoundingClientRect()).to.have.property("left", -100);
    expect(img1.getBoundingClientRect()).to.have.property("right", -80);

    expect(img2.getBoundingClientRect()).to.have.property("left", 0);
    expect(img2.getBoundingClientRect()).to.have.property("right", 20);

    browser.window.scroll(50, 0);

    expect(img1.getBoundingClientRect()).to.have.property("left", 50);
    expect(img1.getBoundingClientRect()).to.have.property("right", 70);

    expect(img2.getBoundingClientRect()).to.have.property("left", 150);
    expect(img2.getBoundingClientRect()).to.have.property("right", 170);
  });

  describe("scrollToTopOfElement()", () => {
    it("scrolls to top of element", async () => {
      const browser = await new Browser(app).navigateTo("/");

      browser.setElementsToScroll((document) => {
        return document.getElementsByTagName("img");
      });

      const elements = browser.document.getElementsByTagName("img");
      const img1 = elements[0];
      const img2 = elements[1];
      img1._setBoundingClientRect({ top: 100, bottom: 120 });
      img2._setBoundingClientRect({ top: 200, bottom: 220 });

      browser.scrollToTopOfElement(img1);
      expect(browser.window.pageYOffset).to.equal(100);

      expect(img1.getBoundingClientRect()).to.have.property("top", 0);
      expect(img2.getBoundingClientRect()).to.have.property("top", 100);

      browser.scrollToTopOfElement(img2);
      expect(browser.window.pageYOffset).to.equal(200);

      expect(img1.getBoundingClientRect()).to.have.property("top", -100);
      expect(img2.getBoundingClientRect()).to.have.property("top", 0);

      browser.scrollToTopOfElement(img1, -1);
      expect(browser.window.pageYOffset).to.equal(101);

      expect(img1.getBoundingClientRect()).to.have.property("top", -1);
      expect(img2.getBoundingClientRect()).to.have.property("top", 99);
    });

    it("with offset set top to offset", async () => {
      const browser = await new Browser(app).navigateTo("/");

      browser.setElementsToScroll((document) => {
        return document.getElementsByTagName("img");
      });

      const elements = browser.document.getElementsByTagName("img");
      const img1 = elements[0];
      const img2 = elements[1];
      img1._setBoundingClientRect({ top: 100, bottom: 120 });
      img2._setBoundingClientRect({ top: 200, bottom: 220 });

      browser.scrollToTopOfElement(img1, -10);
      expect(browser.window.pageYOffset).to.equal(110);

      expect(img1.getBoundingClientRect()).to.have.property("top", -10);
      expect(img2.getBoundingClientRect()).to.have.property("top", 90);

      browser.scrollToTopOfElement(img2, 10);
      expect(browser.window.pageYOffset).to.equal(190);

      expect(img1.getBoundingClientRect()).to.have.property("top", -90);
      expect(img2.getBoundingClientRect()).to.have.property("top", 10);
    });

    it("offset cannot scroll above pageYOffset 0", async () => {
      const browser = await new Browser(app).navigateTo("/");
      browser._resize(undefined, 600);

      browser.setElementsToScroll((document) => {
        return document.getElementsByTagName("img");
      });

      const elements = browser.document.getElementsByTagName("img");
      const img1 = elements[0];
      const img2 = elements[1];
      img1._setBoundingClientRect({ top: 700, bottom: 720 });
      img2._setBoundingClientRect({ top: 900, bottom: 920 });

      browser.scrollToTopOfElement(img1, 99999);
      expect(browser.window.pageYOffset).to.equal(0);

      expect(img1.getBoundingClientRect()).to.have.property("top", 700);
      expect(img2.getBoundingClientRect()).to.have.property("top", 900);
    });

  });

  describe("scrollToBottomOfElement()", () => {
    it("sets bottom of element to window.innerHeight", async () => {
      const browser = await new Browser(app).navigateTo("/");
      browser._resize(undefined, 600);

      browser.setElementsToScroll((document) => {
        return document.getElementsByTagName("img");
      });

      const elements = browser.document.getElementsByTagName("img");
      const img1 = elements[0];
      const img2 = elements[1];
      img1._setBoundingClientRect({ top: 700, bottom: 720 });
      img2._setBoundingClientRect({ top: 900, bottom: 920 });

      browser.scrollToBottomOfElement(img1);
      expect(browser.window.pageYOffset).to.equal(120);

      expect(img1.getBoundingClientRect()).to.have.property("top", 580);
      expect(img2.getBoundingClientRect()).to.have.property("top", 780);

      browser.scrollToBottomOfElement(img2);
      expect(browser.window.pageYOffset).to.equal(320);

      expect(img1.getBoundingClientRect()).to.have.property("top", 380);
      expect(img2.getBoundingClientRect()).to.have.property("top", 580);
    });

    it("with offset includes offset from bottom", async () => {
      const browser = await new Browser(app).navigateTo("/");
      browser._resize(undefined, 600);

      browser.setElementsToScroll((document) => {
        return document.getElementsByTagName("img");
      });

      const elements = browser.document.getElementsByTagName("img");
      const img1 = elements[0];
      const img2 = elements[1];
      img1._setBoundingClientRect({ top: 700, bottom: 720 });
      img2._setBoundingClientRect({ top: 900, bottom: 920 });

      browser.scrollToBottomOfElement(img1, -10);
      expect(browser.window.pageYOffset).to.equal(130);

      expect(img1.getBoundingClientRect()).to.have.property("top", 570);
      expect(img2.getBoundingClientRect()).to.have.property("top", 770);

      browser.scrollToBottomOfElement(img2, 10);
      expect(browser.window.pageYOffset).to.equal(310);

      expect(img1.getBoundingClientRect()).to.have.property("top", 390);
      expect(img2.getBoundingClientRect()).to.have.property("top", 590);
    });

    it("offset cannot scroll above pageYOffset 0", async () => {
      const browser = await new Browser(app).navigateTo("/");
      browser._resize(undefined, 600);

      browser.setElementsToScroll((document) => {
        return document.getElementsByTagName("img");
      });

      const elements = browser.document.getElementsByTagName("img");
      const img1 = elements[0];
      const img2 = elements[1];

      img1._setBoundingClientRect({ top: 700, bottom: 720 });
      img2._setBoundingClientRect({ top: 900, bottom: 920 });

      browser.scrollToBottomOfElement(img1, 99999);
      expect(browser.window.pageYOffset).to.equal(0);

      expect(img1.getBoundingClientRect()).to.have.property("top", 700);
      expect(img2.getBoundingClientRect()).to.have.property("top", 900);
    });
  });

  describe("stickElementToTop()", () => {
    it("sets top of element to 0", async () => {
      const browser = await new Browser(app).navigateTo("/");

      browser.setElementsToScroll((document) => {
        return document.getElementsByTagName("img");
      });

      const elements = browser.document.getElementsByTagName("img");
      const img1 = elements[0];
      const img2 = elements[1];

      img1._setBoundingClientRect({ top: 700, bottom: 720 });
      img2._setBoundingClientRect({ top: 900, bottom: 920 });

      browser.stickElementToTop(img1);

      expect(img1.getBoundingClientRect()).to.have.property("top", 0);
      expect(img2.getBoundingClientRect()).to.have.property("top", 900);

      browser.unstickElementFromTop(img1);

      expect(img1.getBoundingClientRect()).to.have.property("top", 700);
      expect(img2.getBoundingClientRect()).to.have.property("top", 900);
    });

    it("unstickElementFromTop() resets top in regard to scroll", async () => {
      const browser = await new Browser(app).navigateTo("/");

      browser.setElementsToScroll((document) => {
        return document.getElementsByTagName("img");
      });

      const elements = browser.document.getElementsByTagName("img");
      const img1 = elements[0];
      const img2 = elements[1];

      img1._setBoundingClientRect({ top: 700, bottom: 720 });
      img2._setBoundingClientRect({ top: 900, bottom: 920 });

      browser.stickElementToTop(img1);

      browser.window.scroll(0, 100);

      expect(img1.getBoundingClientRect()).to.have.property("top", 0);
      expect(img2.getBoundingClientRect()).to.have.property("top", 800);

      browser.unstickElementFromTop(img1);

      expect(img1.getBoundingClientRect()).to.have.property("top", 600);
      expect(img2.getBoundingClientRect()).to.have.property("top", 800);
    });

    it("cannot scroll to sticky element", async () => {
      const browser = await new Browser(app).navigateTo("/");

      browser.setElementsToScroll((document) => {
        return document.getElementsByTagName("img");
      });

      const img1 = browser.document.getElementsByTagName("img")[0];

      browser.stickElementToTop(img1);
      expect(() => browser.scrollToTopOfElement(img1)).to.throw("Cannot scroll to sticky element");
      expect(() => browser.scrollToBottomOfElement(img1)).to.throw("Cannot scroll to sticky element");
    });
  });

  describe("use with IntersectionObserver", () => {
    it("listens to window scroll", async () => {
      const browser = await new Browser(app).navigateTo("/");
      browser.window.IntersectionObserver = fakeIntersectionObserver(browser);

      browser.setElementsToScroll((document) => {
        return document.getElementsByTagName("img");
      });

      const lazyLoaded = browser.document.getElementsByClassName("lazy-load")[0];
      lazyLoaded._setBoundingClientRect({ top: 300 });

      await new Script(path.resolve("app/assets/scripts/main.js")).run(browser.window);

      browser.scrollToTopOfElement(lazyLoaded);

      expect(lazyLoaded.classList.contains("lazy-load")).to.be.false;
    });
  });
});
