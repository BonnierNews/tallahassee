const {strict: assert} = require("assert");
const app = require("./app.js");
const Browser = require("../../../index.js");
const Painter = require("../../../lib/painter.js");
const reset = require("../helpers/reset.js");

Feature("lazy load", () => {
	before(reset);

	let page, dom, paint;
	before("load page", async () => {
		const browser = Browser(app);
		page = browser.newPage();
		const painter = Painter();
		dom = await page.navigateTo("/", {}, {
			beforeParse (window) {
				paint = painter.init(window);
			}
		});
	});

	let images;
	Given("three images", () => {
		images = dom.window.document.getElementsByTagName("img");
		assert.equal(images.length, 3);
	});

	And("they are not loaded", () => {
		for (let i = 0; i < images.length; ++i) {
			const image = images[i];
			assert.equal(image.getAttribute("src"), "/placeholder.gif");
		}
	});

	And("only the first one is located within the viewport", () => {
		for (let i = 0; i < images.length; ++i) {
			paint(images[i], { y: i * 2 * dom.window.innerHeight });
		}
	});

	When("scripts are executed", async () => {
		await page.runScripts();
	});

	Then("the first image is loaded", () => {
		for (let i = 0; i < 1; ++i) {
			const image = images[i];
			assert.equal(image.getAttribute("src"), `/image-${i + 1}.avif`);
		}
	});

	But("the other aren't", () => {
		for (let i = 1; i < images.length; ++i) {
			const image = images[i];
			assert.equal(image.getAttribute("src"), "/placeholder.gif");
		}
	});

	When("the document is scrolled", async () => {
		dom.window.scroll(0, 1);
	});

	Then("status is unchanged", () => {
		for (let i = 1; i < images.length; ++i) {
			const image = images[i];
			assert.equal(image.getAttribute("src"), "/placeholder.gif");
		}
	});

	When("the second image is scrolled into view", async () => {
		images[1].scrollIntoView();
	});

	Then("the second image is loaded", () => {
		for (let i = 0; i < 2; ++i) {
			const image = images[i];
			assert.equal(image.getAttribute("src"), `/image-${i + 1}.avif`);
		}
	});

	But("the other aren't", () => {
		for (let i = 2; i < images.length; ++i) {
			const image = images[i];
			assert.equal(image.getAttribute("src"), "/placeholder.gif");
		}
	});
});
