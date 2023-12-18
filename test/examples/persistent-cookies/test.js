'use strict';

const app = require('./app.js');
const jsdom = require('jsdom');
const setup = require('../helpers/setup.js');
const { Browser, Resources } = require('../../../index.js');
const { strict: assert } = require('assert');

Feature('persistent cookies', () => {
	const pendingServerOrigin = setup(app);

	const url = new URL('https://tallahassee.io/');
	let reverseProxy;
	before('set up reverse proxy', async () => {
		const origin = await pendingServerOrigin;
		reverseProxy = new Browser.ReverseProxy(url.origin, origin, {
			'x-forwarded-proto': url.protocol.slice(0, -1),
			'x-forwarded-host': url.hostname,
		});
	});

	after('tear down reverse proxy', () => {
		reverseProxy.clear();
	});

	let cookieJar;
	Given('credentials in a cookie', () => {
		cookieJar = new jsdom.CookieJar();
		cookieJar.setCookieSync('loggedIn=1; HttpOnly', url.href);
	});

	let browser, pendingDom, resources;
	When('visiting a page requiring authentication', () => {
		browser = new Browser(url.origin, cookieJar);
		resources = new Resources();
		pendingDom = browser.navigateTo(url.href, {}, { resources });
	});

	let dom;
	Then('we are allowed in', async () => {
		dom = await pendingDom;
	});

	And('we\'ve been been sent a cookie', () => {
		assert.equal(dom.window.document.cookie, 'incremental=0');
	});

	When('scripts are executed', async () => {
		await resources.runScripts(dom);
	});

	Then('cookie value has been incremented', () => {
		assert.equal(dom.window.document.cookie, 'incremental=1');
	});

	let pendingFetchResponseEvent;
	When('client side request is completed', () => {
		pendingFetchResponseEvent = new Promise(resolve => {
			dom.window.addEventListener('fetchresponse', resolve);
		});

		dom.window.document.querySelector('button').click();

		return pendingFetchResponseEvent;
	});

	Then('it was successful', async () => {
		const event = await pendingFetchResponseEvent;
		assert.equal(event.detail.status, 200);
	});

	And('cookie value has been incremented', () => {
		assert.equal(dom.window.document.cookie, 'incremental=2');
	});

	When('visiting the page again', () => {
		pendingDom = browser.navigateTo(url);
	});

	Then('we are still allowed in', async () => {
		dom = await pendingDom;
	});

	And('cookie value has been incremented', () => {
		assert.equal(dom.window.document.cookie, 'incremental=3');
	});
});
