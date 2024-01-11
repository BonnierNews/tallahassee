'use strict';

const assert = require('assert/strict');
const Browser = require('../lib/browser.js');
const nock = require('nock');

describe('Browser', () => {
	before(() => nock.disableNetConnect());
	beforeEach(() => nock.cleanAll());
	after(() => nock.enableNetConnect());

	describe('browsing', () => {
		const origin = 'http://example.com';
		const browser = new Browser(origin);

		it('loads document string', async () => {
			const dom = await browser.load('<title>Document from string');
			assert(dom.window.document.title, 'Document from string');
		});

		it('loads document from URL', async () => {
			nock(origin)
				.get('/')
				.reply(200, '<title>Document from URL');
			const dom = await browser.navigateTo('/');
			assert(dom.window.document.title, 'Document from URL');
		});

		it('loads document from response', async () => {
			nock(origin)
				.post('/secure')
				.reply((path, body) => {
					return body === 'password' ?
						[ 200, '<title>Welcome' ] :
						[ 401, '<title>Get out' ];
				});
			const response = await browser.request('/secure', {
				method: 'post',
				body: 'password'
			});
			assert.equal(response.statusCode, 200);

			const dom = await browser.load(response);
			assert(dom.window.document.title, 'Welcome');
		});

		it('document details from response', async () => {
			nock(origin)
				.get('/not-here')
				.reply(307, undefined, { location: '/here' })
				.get('/here')
				.reply(
					200,
					'<xml><land><zombie /></land></xml>',
					{ 'content-type': 'application/xml' }
				);
			const pendingResponse = browser.request('/not-here');
			const dom = await browser.load(pendingResponse);
			assert.equal(dom.window.location.href, origin + '/here');
			assert.equal(dom.window.document.contentType, 'application/xml');
		});
	});

	describe('.request()', () => {
		const browser = new Browser();
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
