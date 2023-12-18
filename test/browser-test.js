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
			.get(url.pathname + url.search)
			.reply((path, body) => {
				assert.equal(body, 'stick?');
				return [ 200, 'OK' ];
			});

		const response = await request(url, {
			method: 'get',
			body: 'stick?',
		});
		assert.equal(response.statusCode, 200);
		assert.equal(response.body, 'OK');
	});

	it('follows redirects', async () => {
		nock(url.origin)
			.get(url.pathname + url.search)
			.reply(307, undefined, { location: '/second-path' })
			.get('/second-path')
			.reply(307, undefined, { location: '/third-path' })
			.get('/third-path')
			.reply(200, 'OK');

		const response = await request(url, {
			method: 'get',
			headers: { 'req-header': 'stick?' } },
		);
		assert.equal(response.statusCode, 200);
		assert.equal(response.body, 'OK');
	});
});

