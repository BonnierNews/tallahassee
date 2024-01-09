'use strict';

const assert = require('assert/strict');
const Browser = require('../lib/browser.js');
const nock = require('nock');

describe('Browser', () => {
	describe('.request()', () => {
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
				.reply(301, undefined, { location: '/moved-permanently' })
				.post('/moved-permanently')
				.reply(302, undefined, { location: '/found' })
				.post('/found')
				.reply((path, body) => {
					assert.equal(body, 'stick?');
					return [ 303, undefined, { location: '/see-other' } ];
				})
				.get('/see-other')
				.reply((path, body) => {
					if (body) assert.fail('unexpected body');
					return [ 200 ];
				});

			const response = await browser.request(url, {
				method: 'post',
				body: 'stick?',
			});
			assert.equal(response.statusCode, 200);
		});

		it('stores and sends cookies', async () => {
			nock(url.origin)
				.post(url.pathname + url.search)
				.reply(308, undefined, {
					'location': '/secure-location',
					'set-cookie': 'logged-in=1; path=/; httponly',
				})
				.post('/secure-location')
				.reply(303, undefined, { location: '/final-location' })
				.get('/final-location')
				.reply(function () {
					const headers = { ...this.req.headers };
					delete headers.host;
					assert.deepEqual(headers, { cookie: 'logged-in=1' });
					return [ 200 ];
				});

			const response = await browser.request(url, {
				method: 'post',
				headers: { irrelevant: 'header' },
			});
			assert.equal(response.statusCode, 200);
		});
	});
});
