const {strict: assert} = require("assert");
const app = require("./app.js");
const Browser = require("../../../index.js");
const nock = require("nock");
const Painter = require("../../../lib/painter.js");
const reset = require("../helpers/reset.js");
const supertest = require("supertest");

Feature("continuous scroll", () => {
	before(reset);

	let page, dom, paint;
	before("load page", async () => {
		const agent = supertest.agent(app);
		const browser = Browser(agent);
		page = browser.newPage();
		const painter = Painter();
		dom = await page.navigateTo("/", {}, {
			beforeParse (window) {
				paint = painter.init(window);
			}
		});

		nock(dom.window.location.origin)
			.get(/.*/)
			.reply(function forwardToApp(uri, body, callback) {
				agent
					[this.req.method.toLowerCase()](uri)
					.set(this.req.headers)
					.then(res => callback(null, [res.status, res.text, res.headers]))
					.catch(callback);
			})
			.persist();
	});

	let articles;
	Given("one article", () => {
		articles = dom.window.document.getElementsByTagName("article");
		assert.equal(articles.length, 1);
		paint(articles[0], { y: 0, height: dom.window.innerHeight * 2 });
	});

	When("scripts are executed", async () => {
		await page.runScripts();
	});

	let resolvePendingInsertion;
	And("mutations to body are monitored", () => {
		const observer = new dom.window.MutationObserver(() => resolvePendingInsertion());
		observer.observe(dom.window.document.body, {childList: true});
	});

	let pendingInsertion;
	And("document is scrolled towards the end of the article", () => {
		pendingInsertion = new Promise(resolve => resolvePendingInsertion = resolve);
		const { bottom: articleBottom } = articles[0].getBoundingClientRect();
		dom.window.scroll(0, articleBottom - (dom.window.innerHeight / 2));
	});

	Then("a second article is appended", async () => {
		await pendingInsertion;
		assert.equal(articles.length, 2);
		const { bottom: previousArticleBottom } = articles[0].getBoundingClientRect();
		paint(articles[1], { y: previousArticleBottom, height: dom.window.innerHeight * 2 });
	});

	When("document is scrolled towards the end of the second article", () => {
		pendingInsertion = new Promise(resolve => resolvePendingInsertion = resolve);
		const { bottom: articleBottom } = articles[1].getBoundingClientRect();
		dom.window.scroll(0, articleBottom - (dom.window.innerHeight / 2));
	});

	Then("a third article is appended", async () => {
		await pendingInsertion;
		assert.equal(articles.length, 3);
	});
});
