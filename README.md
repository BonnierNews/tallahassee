Tallahassee
===========

![Utilities](https://raw.github.com/ExpressenAB/tallahassee/master/app/assets/images/tallahassee-1.png)

[![Built latest](https://github.com/ExpressenAB/tallahassee/actions/workflows/build-latest.yaml/badge.svg)](https://github.com/ExpressenAB/tallahassee/actions/workflows/build-latest.yaml)

Test your client scripts in a headless browser.

# Introduction

Supports just about everything.

- [API](/docs/API.md)
- [Examples](/docs/Examples.md)
- IntersectionObserver? Yes, check [here](/docs/API.md#intersectionobserver)

# Example:

```javascript
const {app} = require("../app/app");
const Browser = require("@expressen/tallahassee");
const Script = require("@bonniernews/wichita");

describe("Tallahassee", () => {
  describe("navigateTo()", () => {
    it("navigates to url", async () => {
      await Browser(app).navigateTo("/");
    });

    it("throws if not 200", async () => {
      try {
        await Browser(app).navigateTo("/404");
      } catch (e) {
        var err = e; // eslint-disable-line no-var
      }
      expect(err).to.be.ok;
    });

    it("unless you override status code", async () => {
      const browser = await Browser(app).navigateTo("/404", null, 404);
      expect(browser.document.getElementsByTagName("h1")[0].innerText).to.equal("Apocalyptic");
    });
  });

  describe("run script", () => {
    it("run es6 script sources with @bonniernews/wichita", async () => {
      const browser = await Browser(app).navigateTo("/", {
        Cookie: "_ga=1"
      });

      await Script("./app/assets/scripts/main.js").run(browser.window);

      expect(browser.document.cookie).to.equal("_ga=1");
      expect(browser.document.getElementsByClassName("set-by-js")).to.have.length(1);
    });

    it("again", async () => {
      const browser = await Browser(app).navigateTo("/");

      await Script("./app/assets/scripts/main.js").run(browser.window);

      expect(browser.document.cookie).to.equal("");
      expect(browser.document.getElementsByClassName("set-by-js")).to.have.length(0);
    });
  });
});
```

# External scripts

May we suggest you to use Wichita, the Tallahassee sidekick. It can be found here https://www.npmjs.com/package/@bonniernews/wichita

# Timers

If overriding timers on window, e.g. `setTimeout` it can be a good idea to make them asynchronous since they tend to be recurring.

Example:
```js
browser.window.setTimeout = function mySetTimeout(fn, ms, ...args) {
  process.nextTick(fn, ...args);
};
```
