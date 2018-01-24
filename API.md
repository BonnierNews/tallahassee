<!-- version -->
# 0.5.0 API Reference
<!-- versionstop -->

<!-- toc -->

- [Scroll](#scroll)
  - [`browser.scrollToTopOfElement()`](#browserscrolltotopofelement)
  - [`browser.scrollToBottomOfElement()`](#browserscrolltobottomofelement)
  - [`browser.stickElementToTop()`](#browserstickelementtotop)
  - [`browser.unstickElementFromTop()`](#browserunstickelementfromtop)
- [IntersectionObserver](#intersectionobserver)

<!-- tocstop -->

# Scroll

Test you abundant sticky logic.

## `browser.scrollToTopOfElement()`

```javascript
"use strict";

const app = require("../app/app");
const Browser = require("@expressen/tallahassee");
const {Compiler, IntersectionObserver} = require("@expressen/tallahassee/lib");

describe("Window scroller", () => {
  before(() => {
    Compiler.Compiler([/assets\/scripts/]);
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
```

## `browser.scrollToBottomOfElement()`

Scrolls so that element bottom matches `window.innerHeight`.

## `browser.stickElementToTop()`

Set element sticky by fixating element to top.

## `browser.unstickElementFromTop()`

Resets element top to wherever it was before sticked.

# IntersectionObserver

```javascript
"use strict";

const app = require("../app/app");
const Browser = require("@expressen/tallahassee");
const {Compiler, IntersectionObserver, ElementScroller} = require("@expressen/tallahassee/lib");

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

  it("acts on window scroll", async () => {
    const browser = await Browser(app).navigateTo("/", {
      Cookie: "_ga=1"
    });
    browser.window.IntersectionObserver = IntersectionObserver(browser);

    require("../app/assets/scripts/main");

    browser.setElementsToScroll((document) => {
      return document.getElementsByClassName("lazy-load");
    });

    browser.scrollToTopOfElement(browser.document.getElementsByClassName("lazy-load")[0]);

    expect(browser.document.getElementsByClassName("lazy-load").length).to.equal(0);

    expect(browser.document.getElementsByTagName("img")[1].src).to.be.ok;
  });
});
```
