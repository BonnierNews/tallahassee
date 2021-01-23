import {strict as assert} from "assert";
import app from "./app.js";
import Browser from "../../../index.js";
import jsdom from "jsdom";
import reset from "../helpers/reset.js";

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
		browser = Browser(app, cookieJar);
	});

	let page, pendingDom;
	When("visiting a page requiring authentication", () => {
		page = browser.newPage();
		pendingDom = page.navigateTo(url);
	});

	let dom;
	Then("we are allowed in", async () => {
		dom = await pendingDom;
	});

	And("we've been been sent a cookie", () => {
		assert.equal(dom.window.document.cookie, "incremental=0");
	});

	When("scripts are executed", async () => {
		await page.runScripts();
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
