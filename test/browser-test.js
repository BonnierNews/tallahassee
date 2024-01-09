'use strict';

const assert = require('assert/strict');
const Browser = require('../lib/browser.js');
const nock = require('nock');

describe('browser/request', () => {
	before(() => nock.disableNetConnect());
	after(() => nock.enableNetConnect());
	after(() => nock.cleanAll());

	let browser;
	beforeEach(() => browser = new Browser());

	const url = new URL('http://example.com/path?query=string');

	it('makes a get request', async () => {
		nock(url.origin)
			.get(url.pathname + url.search)
			.reply(function () {
				assert.equal(this.req.headers['req-header'], 'stick?');
				return [ 200, 'OK', { 'res-header': 'nu!' } ];
			});

		const response = await browser.request(url, {
			method: 'get',
			headers: { 'req-header': 'stick?' } },
		);
		assert.equal(response.statusCode, 200);
		assert.equal(response.body, 'OK');
		assert.equal(response.headers['res-header'], 'nu!');
	});

	it('makes a post request', async () => {
		nock(url.origin)
			.post(url.pathname + url.search)
			.reply((path, body) => {
				assert.equal(body, 'stick?');
				return [ 200, 'OK' ];
			});

		const response = await browser.request(url, {
			method: 'post',
			body: 'stick?',
		});
		assert.equal(response.statusCode, 200);
		assert.equal(response.body, 'OK');
	});

	it('follows redirects', async () => {
		nock(url.origin)
			.post(url.pathname + url.search)
			.reply(307, undefined, { location: '/temporary-redirect' })
			.post('/temporary-redirect')
			.reply(308, undefined, { location: '/permanent-redirect' })
			.post('/permanent-redirect')
			.reply(302, undefined, { location: '/found' })
			.post('/found')
			.reply(301, undefined, { location: '/moved-permanently' })
			.post('/moved-permanently')
			.reply((path, body) => {
				assert.equal(body, 'stick?');
				return [ 200, 'OK' ];
			});

		const response = await browser.request(url, {
			method: 'post',
			body: 'stick?',
		});
		assert.equal(response.statusCode, 200);
		assert.equal(response.body, 'OK');
	});

	it('cookies are sent', async () => {
		nock(url.origin)
			.get(url.pathname + url.search)
			.reply(308, undefined, {
				'location': '/secure-location',
				'set-cookie': 'logged-in=1; path=/; httponly',
			})
			.get('/secure-location')
			.reply(function () {
				const headers = { ...this.req.headers };
				delete headers.host;
				assert.deepEqual(headers, { cookie: 'logged-in=1' });
				return [ 200, 'OK' ];
			});

		const response = await browser.request(url, {
			headers: { irrelevant: 'header' },
		});
		assert.equal(response.statusCode, 200);
		assert.equal(response.body, 'OK');
	});
});

