<!-- version -->
# 9.1.0 API Reference
<!-- versionstop -->

<!-- toc -->

- [`Tallahassee(app[, options])`](#tallahasseeapp-options)
- [`navigateTo(route[, headers, expectedStatusCode])`](#navigatetoroute-headers-expectedstatuscode)
- [`browser.navigateTo(route[, headers, expectedStatusCode])`](#browsernavigatetoroute-headers-expectedstatuscode)
- [`browser.runScripts([scopeElement])`](#browserrunscriptsscopeelement)
- [Scroll](#scroll)
  - [`browser.scrollToTopOfElement()`](#browserscrolltotopofelement)
  - [`browser.scrollToBottomOfElement()`](#browserscrolltobottomofelement)
  - [`browser.stickElementToTop()`](#browserstickelementtotop)
  - [`browser.unstickElementFromTop()`](#browserunstickelementfromtop)
- [IntersectionObserver](#intersectionobserver)
- [iframe scope](#iframe-scope)

<!-- tocstop -->

# `Tallahassee(app[, options])`

Create new instance of Tallahasse.

- `app`: required express app
- `options`: optional options
  - `headers`: default headers for local trafic

# `navigateTo(route[, headers, expectedStatusCode])`

Navigate to route.

- `route`: path to app route
- `headers`: optional object with headers
- `expectedStatusCode`: optional expected status code, defaults to 200

Returns promise with browser context.

- `$:`: Cheerio context
- `document`
- `focus`: Focus this browser
- `focusIframe`: set focus to Ifram
- `navigateTo`: navigate to route with preserved cookie
- `runScripts`: run scripts found in script tags
- `setElementsToScroll`: set elements to scroll
- `scrollToBottomOfElement`: scroll to bottom of element
- `scrollToTopOfElement`: scroll to top of element
- `stickElementToTop`: stick element to top
- `unstickElementFromTop`: unstick elements from top
- `window`
- `response`: response object

# `browser.navigateTo(route[, headers, expectedStatusCode])`

Returns promise with new browser context with preserved cookies. Takes the same arguments as [`navigateTo`](#navigatetoroute-headers-expectedstatuscode)

# `browser.runScripts([scopeElement])`

Runs script in all script tags.

- `scopeElement`: run descendant script in context element, defaults to `document.documentElement`.

# Scroll

Test you abundant sticky logic.

## `browser.scrollToTopOfElement()`

```javascript
"use strict";

const app = require("../app/app");
const Browser = require("@expressen/tallahassee");
const Script = require("@bonniernews/wichita");
const {IntersectionObserver} = require("@expressen/tallahassee/lib");

describe("Window scroller", () => {
  describe("use with IntersectionObserver", () => {
    it("listens to window scroll", async () => {
      const browser = await Browser(app).navigateTo("/");
      browser.window.IntersectionObserver = IntersectionObserver(browser);

      browser.setElementsToScroll((document) => {
        return document.getElementsByTagName("img");
      });

      const [lazyLoaded] = browser.document.getElementsByClassName("lazy-load");
      lazyLoaded._setBoundingClientRect({top: 300});

      await Script("./app/assets/scripts/main").run(browser.window);

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
const Script = require("@bonniernews/wichita");
const {IntersectionObserver} = require("@expressen/tallahassee/lib");

describe("IntersectionObserver", () => {
  it("observes elements", async () => {
    const browser = await Browser(app).navigateTo("/", {
      Cookie: "_ga=1"
    });
    const intersectionObserver = browser.window.IntersectionObserver = IntersectionObserver(browser);

    await Script("./app/assets/scripts/main").run(browser.window);

    expect(intersectionObserver._getObserved()).to.have.length(1);
  });

  it("acts on window scroll", async () => {
    const browser = await Browser(app).navigateTo("/", {
      Cookie: "_ga=1"
    });
    browser.window.IntersectionObserver = IntersectionObserver(browser);

    await Script("./app/assets/scripts/main").run(browser.window);

    browser.setElementsToScroll((document) => {
      return document.getElementsByClassName("lazy-load");
    });

    browser.scrollToTopOfElement(browser.document.getElementsByClassName("lazy-load")[0]);

    expect(browser.document.getElementsByClassName("lazy-load").length).to.equal(0);

    expect(browser.document.getElementsByTagName("img")[1].src).to.be.ok;
  });
});
```

# iframe scope

Switch scopes between iframe window and main window.

```javascript
"use strict";

const app = require("../app/app");
const Browser = require("@expressen/tallahassee");
const nock = require("nock");

describe("Iframe", () => {
  it("iframe from same host scopes window and document and sets frameElement and inherits cookie", async () => {
    const browser = await Browser(app).navigateTo("/", {cookie: "_ga=2"});
    const element = browser.document.createElement("iframe");

    element.id = "friendly-frame";
    element.src = "/friendly/";
    browser.document.body.appendChild(element);

    const iframe = browser.document.getElementById("friendly-frame");
    const iframeScope = await browser.focusIframe(iframe);

    expect(iframeScope.window === browser.window, "scoped window").to.be.false;
    expect(iframeScope.window.top === browser.window, "window.top").to.be.true;
    expect(iframeScope.document === browser.document, "scoped document").to.be.false;
    expect(iframeScope.document.cookie, "scoped document cookie").to.equal("_ga=2");
    expect(iframeScope.window.frameElement === iframe, "window.frameElement property").to.be.true;
  });

  it("iframe from other host scopes window and document", async () => {
    nock("http://example.com")
      .get("/framed-content")
      .replyWithFile(200, "./app/assets/public/index.html", {
        "Content-Type": "text/html"
      });
    const browser = await Browser(app).navigateTo("/", {cookie: "_ga=2"});
    const element = browser.document.createElement("iframe");
    element.id = "iframe";
    element.src = "//example.com/framed-content";
    browser.document.body.appendChild(element);
    const iframe = browser.document.getElementById("iframe");
    const iframeScope = await browser.focusIframe(iframe);
    expect(iframeScope.window === browser.window, "scoped window").to.be.false;
    expect(iframeScope.window.top, "window.top").to.be.ok;
    expect(() => iframeScope.window.top.location.pathname).to.throw("Blocked a frame with origin \"http://example.com\" from accessing a cross-origin frame.");
    expect(iframeScope.document === browser.document, "scoped document").to.be.false;
    expect(iframeScope.document.cookie, "scoped document cookie").to.equal("");
    expect(iframeScope.window.frameElement, "window.frameElement property").to.be.undefined;
  });
});
```
