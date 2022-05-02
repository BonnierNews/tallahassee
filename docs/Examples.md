Examples
========

<!-- toc -->

- [Capture DOM manipulation with mutation observer](#capture-dom-manipulation-with-mutation-observer)
- [Capture navigation when changing location](#capture-navigation-when-changing-location)
- [Capture navigation when submitting form](#capture-navigation-when-submitting-form)

<!-- tocstop -->

## Capture DOM manipulation with mutation observer

```javascript
"use strict";

const Browser = require("@expressen/tallahassee");

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
    const observer = new browser.window.MutationObserver(function mutaded(e) {
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
