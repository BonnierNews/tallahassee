import {strict as assert} from "assert";
import app from "./app.js";
import Browser from "../../../index.js";
import nock from "nock";
import path from "path";
import reset from "../helpers/reset.js";
import url from "url";

Feature("source code resource", () => {
	before(reset);

	let page, dom;
	before("load page", async () => {
		const browser = Browser(app);
		page = browser.newPage();
		dom = await page.navigateTo("/");
	});

	let script;
	Given("a script reference", () => {
		script = dom.window.document.querySelector("script");
		assert.ok(script);
	});

	And("a source document", () => {
		const referenceUrl = new URL(script.src);
		const dirname = path.dirname(url.fileURLToPath(import.meta.url));
		const sourcePath = path.join(dirname, "source.js");
		nock(referenceUrl.origin)
			.get(referenceUrl.pathname)
			.replyWithFile(200, sourcePath, {
				"content-type": "text/javascript",
			});
	});

	let originalState;
	When("scripts are executed", async () => {
		originalState = dom.window.document.title;
		await page.runScripts();
	});

	Then("source file is executed", () => {
		const newState = dom.window.document.title;
		assert.equal(newState, "Tallahassee");
		assert.notEqual(newState, originalState);
	});
});
