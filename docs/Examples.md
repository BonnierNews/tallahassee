Examples
========

<!-- toc -->

- [Add query selector to Document](#add-query-selector-to-document)
- [Capture DOM manipulation with mutation observer](#capture-dom-manipulation-with-mutation-observer)
- [Capture navigation when changing location](#capture-navigation-when-changing-location)

<!-- tocstop -->

## Add query selector to Document

```javascript
"use strict";

const Browser = require("@expressen/tallahassee");
const Document = require("@expressen/tallahassee/lib/Document");

Document.prototype.querySelector = function querySelector(selector) {
  const elements = this.$(selector);
  if (!elements.length) return null;
  return this._getElement(elements.eq(0));
};

Document.prototype.querySelectorAll = function querySelectorAll(selector) {
  const elements = this.$(selector);
  const result = [];
  for (const elm of elements.toArray()) {
    result.push(this._getElement(elm));
  }
  return result;
};

it("get buttons", async () => {
  const markup = `
    <button id="button-0" data-test-button>Attr</button>
    <button id="button-1" data-test-button>Attr</button>
  `;

  const browser = await new Browser().load(markup);
  browser.runScripts();

  const btn = browser.document.querySelector("[data-test-button]");
  expect(btn.id).to.equal("button-0");

  const btns = browser.document.querySelectorAll("[data-test-button]");
  expect(btns.length).to.equal(2);
});
```

## Capture DOM manipulation with mutation observer

```javascript
"use strict";

const Browser = require("@expressen/tallahassee");
const MutationObserver = require("@expressen/tallahassee/lib/MutationObserver");

it("script mutates DOM", async () => {
  const markup = `
    <button id="mybtn">Add element</button>
    <script>
      var btn = document.getElementById("mybtn");
      btn.onclick = function onclick(e) {
        e.preventDefault();
        e.target.insertAdjacentHTML("afterend", "<p class='p-1'>Blahonga</p>");
      };
    </script>
  `;

  const browser = await new Browser().load(markup);
  browser.runScripts();

  const btn = browser.document.getElementById("mybtn");

  const mutated = new Promise((resolve) => {
    const observer = new MutationObserver(function mutaded(e) {
      resolve(e);
      this.disconnect();
    });

    observer.observe(browser.document.body, {childList: true});
  });

  btn.click();

  await mutated;

  expect(browser.document.getElementsByClassName("p-1").length, "added p").to.equal(1);
});
```

## Capture navigation when changing location

```javascript
"use strict";

const Browser = require("@expressen/tallahassee");

it("script navigates away by changing location", async () => {
  const markup = `
    <body>
      <button id="mybtn">Navigate away</button>
      <script>
        var btn = document.getElementById("mybtn");
        btn.onclick = function onclick(e) {
          e.preventDefault();
          window.location = "https://example.com";
        };
      </script>
    </body>
  `;

  const browser = await new Browser().load(markup);
  browser.runScripts();

  const btn = browser.document.getElementById("mybtn");

  const unload = new Promise((resolve) => browser.window.addEventListener("unload", resolve));

  btn.click();

  await unload;

  expect(browser.window.location.href).to.equal("https://example.com/");
});
```

## Capture navigation when submitting form

```javascript
"use strict";

const Browser = require("@expressen/tallahassee");
const nock = require("nock");
nock.enableNetConnect("127.0.0.1");

it("script navigates away by changing location", async () => {
  nock("https://www.example.local")
    .post("/")
    .reply(302, null, { location: "https://www.example.local/landing" })
    .get("/landing")
    .reply(200, "<p>Success!</p>");

  const markup = `
    <body>
      <form action="https://www.example.local/" method="post">
        <button type="submit">Submit</button>
      </form>
    </body>
  `;

  let browser = await new Browser().load(markup);

  const btn = browser.document.forms[0].getElementsByTagName("button")[0];
  btn.click();

  browser = await browser._pending;

  expect(browser.window.location.href).to.equal("https://www.example.local/landing");
  expect(browser.document.body.innerText).to.contain("Success!");
});
```
