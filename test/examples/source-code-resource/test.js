import {promises as fs} from "fs";
import {strict as assert} from "assert";
import app from "./app.js";
import Browser from "../../../index.js";
import Resoures from "../../../lib/resources.js";
import jsdom from "jsdom";
import path from "path";
import reset from "../helpers/reset.js";
import url from "url";

Feature("source code resource", () => {
	before(reset);

	let resources;
	Given("a source document", () => {
		const dirname = path.dirname(url.fileURLToPath(import.meta.url));
		resources = new Resoures({
			resolveTag (tag) {
				const src = tag.src || tag.dataset.sourceFile;
				if (src?.endsWith("/dist-bundle.js"))
					return "file://" + path.join(dirname, "source-entry.js");
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

	And("an inline script marked as sourced from a file", () => {
		const script = dom.window.document.querySelector("script[data-source-file]");
		assert.ok(script);
		assert.equal(script.dataset.sourceFile, "/dist-bundle.js");
	});

	And("another inline script", () => {
		const script = dom.window.document.querySelector("script:not([src], [data-src])");
		assert.ok(script);
		assert.equal(script.text.length > 0, true);
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
