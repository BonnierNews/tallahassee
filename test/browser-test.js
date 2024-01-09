'use strict';

const assert = require('assert/strict');
const Browser = require('../lib/browser.js');
const nock = require('nock');

const request = Browser.request;

describe('browser/request', () => {
	before(() => nock.disableNetConnect());
	after(() => nock.enableNetConnect());
	after(() => nock.cleanAll());

	const url = new URL('http://example.com/path?query=string');

	it('makes a get request', async () => {
		nock(url.origin)
			.get(url.pathname + url.search)
			.reply(function () {
				assert.equal(this.req.headers['req-header'], 'stick?');
				return [ 200, 'OK', { 'res-header': 'nu!' } ];
			});

		const response = await request(url, {
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

		const response = await request(url, {
			method: 'post',
			body: 'stick?',
		});
		assert.equal(response.statusCode, 200);
		assert.equal(response.body, 'OK');
	});

	it('follows redirects', async () => {
		nock(url.origin).get(url.pathname + url.search)
			.reply(307, undefined, { location: '/temporary-redirect' })
			.get('/temporary-redirect')
			.reply(308, undefined, { location: '/permanent-redirect' })
			.get('/permanent-redirect')
			.reply(302, undefined, { location: '/found' })
			.get('/found')
			.reply(301, undefined, { location: '/moved-permanently' })
			.get('/moved-permanently')
			.reply(200, 'OK');

		const response = await request(url);
		assert.equal(response.statusCode, 200);
		assert.equal(response.body, 'OK');
	});
});

