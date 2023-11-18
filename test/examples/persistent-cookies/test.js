'use strict';

const nock = require('nock');
const supertest = require('supertest');
const { strict: assert } = require('assert');
const app = require('./app.js');
const { Browser, Resources } = require('../../../index.js');
const jsdom = require('jsdom');
const reset = require('../helpers/reset.js');

describe.only('reverse proxy emulation', () => {
	it('persists then clears', async () => {
		nock.disableNetConnect();

		const url = new URL('https://tallahassee.io/stick/');
		console.log(1);
		const unmockedError = await supertest(url.origin)
			.get(url.pathname)
			.then(() => null)
			.catch(error => error);
		assert(unmockedError);

		const interceptors = [ 'get', 'post' ]
			.map(verb => {
				const scope = nock(url.origin).persist();
				const interceptor = scope.intercept(url.pathname, verb);
				interceptor.reply(200);
				return interceptor;
			});

		console.log(nock.pendingMocks());

		console.log(2);
		await supertest(url.origin)
			.get(url.pathname);

		console.log(3);
		await supertest(url.origin)
			.get(url.pathname);

		console.log(4);
		await supertest(url.origin)
			.post(url.pathname);

		interceptors.forEach(i => nock.removeInterceptor(i));

		console.log(5);
		const deadGetMockedError = await supertest(url.origin)
			.get(url.pathname)
			.then(() => null)
			.catch(error => error);
		assert(deadGetMockedError);

		console.log(6);
		const deadPostMockedError = await supertest(url.origin)
			.post(url.pathname)
			.then(() => null)
			.catch(error => error);
		assert(deadPostMockedError);

		console.log(nock.pendingMocks());
	});
});

Feature('persistant cookies', () => {
	before(reset);

	const url = 'https://tallahassee.io/';
	let cookieJar;
	Given('credentials in a cookie', () => {
		cookieJar = new jsdom.CookieJar();
		cookieJar.setCookieSync('loggedIn=1; HttpOnly', url);
	});

	let browser, pendingDom, resources;
	When('visiting a page requiring authentication', () => {
		browser = new Browser(app, cookieJar);
		resources = new Resources();
		pendingDom = browser.navigateTo(url, { resources });
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

	When('visiting the page again', () => {
		pendingDom = browser.navigateTo(url);
	});

	Then('we are still allowed in', async () => {
		dom = await pendingDom;
	});

	And('cookie value has been incremented', () => {
		assert.equal(dom.window.document.cookie, 'incremental=2');
	});
});
