"use strict";

const { Browser, Resources } = require("../../../index.js");
const { strict: assert } = require("assert");
const app = require("./app.js");
const path = require("path");
const reset = require("../helpers/reset.js");

Feature("source code resource", () => {
  before(reset);

  let resources;
  Given("a source document", () => {
    resources = new Resources({
      resolveTag (tag) {
        const src = tag.src || tag.dataset.sourceFile;
        if (src?.endsWith("/dist-bundle.js")) {
          return `file://${path.join(__dirname, "source-entry.mjs")}`;
        }
      }
    });
  });

  let browser, page, dom;
  When("load page", async () => {
    browser = Browser(app);
    page = browser.newPage();
    dom = await page.navigateTo("/", {}, {
      resources,
    });
  });

  And("a script referencing a bundle", () => {
    const script = dom.window.document.querySelector("script[src]");
    assert.ok(script);
    assert.equal(script.src, "http://localhost:7411/dist-bundle.js");
  });

  And("an inline script marked: sourced from a file", () => {
    const script = dom.window.document.querySelector("script[data-source-file]");
    assert.ok(script);
    assert.equal(script.dataset.sourceFile, "/dist-bundle.js");
  });

  And("another inline script", () => {
    const script = dom.window.document.querySelector("script:not([src], [data-src])");
    assert.ok(script);
    assert.equal(script.text.trim().length > 0, true);
  });

  When("scripts are executed", async () => {
    assert.equal(dom.window.document.title, "Document");
    await resources.runScripts(dom);
  });

  Then("source files and inline scripts have been executed", () => {
    assert.equal(dom.window.document.title, [
      "Document",
      "edit from source entry",
      "edit from source component",
      "edit from source entry",
      "edit from source component",
      "edit from inline script",
    ].join(" | "));
  });
});
