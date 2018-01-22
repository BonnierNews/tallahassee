Tallahassee
===========

![Utilities](https://raw.github.com/ExpressenAB/tallahassee/master/app/assets/images/tallahassee-1.png)

[![Build Status](https://travis-ci.org/ExpressenAB/tallahassee.svg?branch=master)](https://travis-ci.org/ExpressenAB/tallahassee)[![dependencies Status](https://david-dm.org/ExpressenAB/tallahassee/status.svg)](https://david-dm.org/ExpressenAB/tallahassee)

Test your client scripts in a headless browser.

# Introduction

Supports just about everything except `querySelectorAll()` which we don´t want developers to use.

- IntersectionObserver? Yes, check [here](#intersectionobserver)

# Example:

```javascript
"use strict";

const app = require("../app/express-js-app");
const Browser = require("@expressen/tallahassee");
const {Compiler} = require("@expressen/tallahassee/lib/Compiler");

describe("Tallahassee", () => {
  before(() => {
    Compiler([/assets\/scripts/]);
  });

  describe("navigateTo()", () => {
    it("navigates to url", async () => {
      await Browser(app).navigateTo("/");
    });

    it("throws if not 200", async () => {
      try {
        await Browser(app).navigateTo("/../");
      } catch (e) {
        var err = e; // eslint-disable-line no-var
      }
      expect(err).to.be.ok;
    });
  });

  describe("run script", () => {
    it("transpiles and runs es6 script", async () => {
      const browser = await Browser(app).navigateTo("/", {
        Cookie: "_ga=1"
      });

      require("../app/assets/scripts/main");

      expect(browser.document.cookie).to.equal("_ga=1;");
      expect(browser.document.getElementsByClassName("set-by-js")).to.have.length(1);
    });

    it("again", async () => {
      const browser = await Browser(app).navigateTo("/");

      require("../app/assets/scripts/main");

      expect(browser.document.cookie).to.equal("");
      expect(browser.document.getElementsByClassName("set-by-js")).to.have.length(0);
    });
  });
});
```

# Api

## IntersectionObserver

```javascript
"use strict";

const app = require("../app/express-js-app");
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
```
