import {promises as fs} from "fs";
import {strict as assert} from "assert";
import app from "./app.js";
import Browser from "../../../index.js";
import jsdom from "jsdom";
import path from "path";
import reset from "../helpers/reset.js";
import url from "url";

class CustomResourceLoader extends jsdom.ResourceLoader {
	constructor (resolve) {
		super();
		this.resolve = resolve || (() => {});
	}

	fetch(resource, options) {
		const sourceFilePath = this.resolve(resource);
		return sourceFilePath ?
			fs.readFile(sourceFilePath) :
 		super.fetch(resource, options);
	}
}

Feature("source code resource", () => {
	before(reset);

	let distUrl, sourcePath, resourceLoader;
	Given("a source document", () => {
		const dirname = path.dirname(url.fileURLToPath(import.meta.url));
		distUrl = "http://localhost:7411/dist-bundle.js";
		sourcePath = path.join(dirname, "source-entry.js");
		resourceLoader = new CustomResourceLoader((url) => {
			if (url === distUrl) return sourcePath;
		});
	});

	let page, dom;
	When("load page", async () => {
		const browser = Browser(app);
		page = browser.newPage();
		dom = await page.navigateTo("/", {}, {
			resources: resourceLoader,
		});
	});

	let script;
	And("a script references a bundle", () => {
		script = dom.window.document.querySelector("script");
		assert.ok(script);
		assert.equal(script.src, distUrl);
	});

	let originalState;
	When("scripts are executed", async () => {
		originalState = dom.window.document.title;
		await page.runScripts();
	});

	Then("source files is executed", () => {
		const newState = dom.window.document.title;
		assert.equal(newState, "Tallahassee");
		assert.notEqual(newState, originalState);
	});
});
