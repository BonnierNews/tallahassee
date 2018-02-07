"use strict";

const app = require("../app/app");
const Browser = require("../");
const {Compiler, IntersectionObserver} = require("../lib");

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

    const lazyLoadElements = browser.document.getElementsByClassName("lazy-load");

    expect(lazyLoadElements.length).to.equal(1);


    require("../app/assets/scripts/main");

    browser.setElementsToScroll(() => {
      return lazyLoadElements;
    });

    const [lazyLoadElement] = lazyLoadElements;
    browser.scrollToTopOfElement(lazyLoadElement);
    expect(lazyLoadElement.classList.contains("lazy-load")).to.be.false;

    expect(browser.document.getElementsByTagName("img")[1].src).to.be.ok;
  });
});
