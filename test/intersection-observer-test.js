"use strict";

const app = require("../app/app");
const Browser = require("../");
const {Compiler, IntersectionObserver, ElementScroller} = require("../lib");

describe("IntersectionObserver", () => {
  before(() => {
    Compiler.Compiler([/assets\/scripts/]);
  });

  it("observes elements", async () => {
    const browser = await Browser(app).navigateTo("/", {
      Cookie: "_ga=1"
    });
    const intersectionObserver = browser.window.IntersectionObserver = IntersectionObserver(browser);

    require("../app/assets/scripts/main");

    expect(intersectionObserver._getObserved()).to.have.length(1);
  });

  it("listens to window scroll", async () => {
    const browser = await Browser(app).navigateTo("/", {
      Cookie: "_ga=1"
    });
    browser.window.IntersectionObserver = IntersectionObserver(browser);

    require("../app/assets/scripts/main");

    const scroller = ElementScroller(browser, () => {
      return browser.document.getElementsByClassName("lazy-load");
    });

    scroller.scrollToTopOfElement(browser.document.getElementsByClassName("lazy-load")[0]);

    expect(browser.document.getElementsByClassName("lazy-load").length).to.equal(0);

    expect(browser.document.getElementsByTagName("img")[1].src).to.be.ok;
  });
});
