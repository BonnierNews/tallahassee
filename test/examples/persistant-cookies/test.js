const {strict: assert} = require("assert");
const app = require("./app.js");
const {Browser, Resources} = require("../../../index.js");
const jsdom = require("jsdom");
const reset = require("../helpers/reset.js");

Feature("persistant cookies", () => {
	before(reset);

	let loggedInCookie;
	Given("logged in information in a cookie", () => {
		loggedInCookie = new jsdom.toughCookie.Cookie.parse("loggedIn=1; HttpOnly;");
	});

	let browser;
	const url = "https://tallahassee.io/";
	And("it is stored in the browser", () => {
		const cookieJar = new jsdom.CookieJar();
		cookieJar.setCookieSync(loggedInCookie, url);
	});

	let page, pendingDom, resources;
	When("visiting a page requiring authentication", () => {
		page = browser.newPage();
		browser = Browser(app, cookieJar);
		resources = new Resources();
		pendingDom = page.navigateTo(url, {resources});
	});

	let dom;
	Then("we are allowed in", async () => {
		dom = await pendingDom;
	});

	And("we've been been sent a cookie", () => {
		assert.equal(dom.window.document.cookie, "incremental=0");
	});

	When("scripts are executed", async () => {
		await resources.runScripts();
	});

	Then("cookie value has been incremented" , () => {
		assert.equal(dom.window.document.cookie, "incremental=1");
	});

	When("visiting the page again", () => {
		page = browser.newPage();
		pendingDom = page.navigateTo(url);
	});

	Then("we are still allowed in", async () => {
		dom = await pendingDom;
	});

	And("cookie value has been incremented", () => {
		assert.equal(dom.window.document.cookie, "incremental=2");
	});
});
