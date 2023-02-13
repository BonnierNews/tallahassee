import Script from "@bonniernews/wichita";
import path from "path";

import { app } from "../app/app.js";
import Browser from "../index.js";
import { IntersectionObserver as fakeIntersectionObserver } from "../lib/index.js";

describe("IntersectionObserver", () => {
  it("observes elements", async () => {
    const browser = await new Browser(app).navigateTo("/", { Cookie: "_ga=1" });
    const intersectionObserver = browser.window.IntersectionObserver = fakeIntersectionObserver(browser);

    await new Script(path.resolve("app/assets/scripts/main.js")).run(browser.window);

    expect(intersectionObserver._getObserved()).to.have.length(1);
    expect(browser.window.IntersectionObserverEntry).to.exist;
  });

  it("listens to window scroll", async () => {
    const browser = await new Browser(app).navigateTo("/", { Cookie: "_ga=1" });
    browser.window.IntersectionObserver = fakeIntersectionObserver(browser);

    const lazyLoadElements = browser.document.getElementsByClassName("lazy-load");

    expect(lazyLoadElements.length).to.equal(1);

    await new Script(path.resolve("app/assets/scripts/main.js")).run(browser.window);

    browser.setElementsToScroll(() => {
      return lazyLoadElements;
    });

    const lazyLoadElement = lazyLoadElements[0];
    browser.scrollToTopOfElement(lazyLoadElement);
    expect(lazyLoadElement.classList.contains("lazy-load")).to.be.false;

    expect(browser.document.getElementsByTagName("img")[1].src).to.be.ok;
  });

  it("calls viewPortUpdate with correct elements when observing new elements", async () => {
    const browser = await new Browser(app).navigateTo("/");
    const [ element1 ] = browser.document.getElementsByClassName("observer-test-1");
    const [ element2 ] = browser.document.getElementsByClassName("observer-test-2");
    const [ element3 ] = browser.document.getElementsByClassName("observer-test-3");

    browser.window.IntersectionObserver = fakeIntersectionObserver(browser);
    let intersectingEntries = [];

    const observer = new browser.window.IntersectionObserver((entries) => {
      intersectingEntries = entries.slice();
    });

    observer.observe(element1);
    observer.observe(element2);

    expect(intersectingEntries).to.have.length(0);

    await new Promise((resolve) => process.nextTick(resolve));

    expect(intersectingEntries).to.have.length(2);
    expect(intersectingEntries[0]).to.have.property("target", element1);
    expect(intersectingEntries[1]).to.have.property("target", element2);

    observer.observe(element3);
    await new Promise((resolve) => process.nextTick(resolve));

    expect(intersectingEntries).to.have.length(1);
    expect(intersectingEntries[0]).to.have.property("target", element3);
  });

  it("unobserves element", async () => {
    const browser = await new Browser(app).navigateTo("/");
    const [ element1 ] = browser.document.getElementsByClassName("observer-test-1");
    const [ element2 ] = browser.document.getElementsByClassName("observer-test-2");

    browser.window.IntersectionObserver = fakeIntersectionObserver(browser);
    let intersectingEntries = [];

    const observer = new browser.window.IntersectionObserver((entries) => {
      intersectingEntries = entries.slice();
    });

    observer.observe(element1);
    observer.observe(element2);

    expect(intersectingEntries).to.have.length(0);

    observer.unobserve(element2);

    await new Promise((resolve) => process.nextTick(resolve));

    expect(intersectingEntries).to.have.length(1);
    expect(intersectingEntries[0]).to.have.property("target", element1);
  });

  it("calls viewPortUpdate with correct element when scrolling", async () => {
    const browser = await new Browser(app).navigateTo("/");
    browser.window._resize(1024, 768);
    const [ element1 ] = browser.document.getElementsByClassName("observer-test-1");
    const [ element2 ] = browser.document.getElementsByClassName("observer-test-2");

    element1._setBoundingClientRect({ top: 200, bottom: 300 });
    element2._setBoundingClientRect({ top: 400, bottom: 500 });

    browser.setElementsToScroll(() => [ element1, element2 ]);

    browser.window.IntersectionObserver = fakeIntersectionObserver(browser);
    let intersectingEntries = [];
    let timesCalled = 0;

    const observer = new browser.window.IntersectionObserver((entries) => {
      intersectingEntries = entries.slice();
      timesCalled++;
    }, { rootMargin: "10px 0 10px" });

    observer.observe(element1);
    observer.observe(element2);
    await new Promise((resolve) => process.nextTick(resolve));

    timesCalled = 0;
    intersectingEntries.length = 0;

    browser.scrollToTopOfElement(element1);

    expect(timesCalled).to.equal(0);
    expect(intersectingEntries).to.be.empty;

    browser.scrollToTopOfElement(element1, -11);

    expect(timesCalled).to.equal(1);
    expect(intersectingEntries).to.have.length(1);
    expect(intersectingEntries[0]).to.have.property("target", element1);

    browser.scrollToTopOfElement(element2);
    timesCalled = 0;
    intersectingEntries.length = 0;

    browser.scrollToTopOfElement(element2, -11);

    expect(timesCalled).to.equal(1);
    expect(intersectingEntries).to.have.length(1);
    expect(intersectingEntries[0]).to.have.property("target", element2);

    timesCalled = 0;
    intersectingEntries.length = 0;

    browser.scrollToTopOfElement(element1);
    expect(timesCalled).to.equal(1);
    expect(intersectingEntries).to.have.length(2);
    expect(intersectingEntries[0]).to.have.property("target", element1);
    expect(intersectingEntries[1]).to.have.property("target", element2);
  });

  it("clears targets on disconnect", async () => {
    const browser = await new Browser(app).navigateTo("/");
    browser.window._resize(1024, 100);
    const [ element1 ] = browser.document.getElementsByClassName("observer-test-1");
    const [ element2 ] = browser.document.getElementsByClassName("observer-test-2");

    element1._setBoundingClientRect({ top: 200, bottom: 300 });
    element2._setBoundingClientRect({ top: 400, bottom: 500 });

    browser.setElementsToScroll(() => [ element1, element2 ]);

    browser.window.IntersectionObserver = fakeIntersectionObserver(browser);
    let timesCalled = 0;
    const observer = new browser.window.IntersectionObserver(() => timesCalled++);

    observer.observe(element1);
    observer.observe(element2);
    await new Promise((resolve) => process.nextTick(resolve));

    timesCalled = 0;

    browser.scrollToTopOfElement(element1, -1);
    browser.scrollToTopOfElement(element2, -1);
    browser.window.scroll(0, 0);
    expect(timesCalled).to.equal(3);

    timesCalled = 0;
    observer.disconnect();

    browser.scrollToTopOfElement(element1, -1);
    browser.scrollToTopOfElement(element2, -1);
    browser.window.scroll(0, 0);
    expect(timesCalled).to.equal(0);

    observer.observe(element1);
    await new Promise((resolve) => process.nextTick(resolve));

    timesCalled = 0;

    browser.scrollToTopOfElement(element1, -1);
    browser.scrollToTopOfElement(element2, -1);
    browser.window.scroll(0, 0);
    expect(timesCalled).to.equal(2);
  });
});
