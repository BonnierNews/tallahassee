'use strict';

const jsdom = require('jsdom');
const nock = require('nock');
const supertest = require('supertest');

module.exports = function Browser (agentOrApp, cookieJar) {
	cookieJar = cookieJar || new jsdom.CookieJar();

	return {
		newPage,
		cookieJar,
	};

	function newPage () {
		return Page(agentOrApp, cookieJar);
	}
};

function Page (agentOrApp, cookieJar) {
	let reqURL, resURL;
	const agent = agentOrApp.listen ?
		supertest.agent(agentOrApp) :
		agentOrApp;

	return {
		navigateTo,
		request,
	};

	async function navigateTo (url, headers, jsdomConfig) {
		const response = await request('get', url, headers);

		// TODO: put containRequests behind option
		containRequests(resURL);
		return load(response, jsdomConfig);
	}

	async function request (method, url, headers = {}, body) {
		reqURL = resolveURL(url);
		persistCookies(reqURL, headers);

		const pendingRequest = agent[method.toLowerCase()](reqURL.pathname)
			.set({
				...headers,
				cookie: cookieJar.getCookieStringSync(reqURL.href),
			});

		if (body) pendingRequest.send(body);

		const response = await pendingRequest;

		// TODO: test redirection responses
		resURL = resolveURL(headers.location || reqURL, reqURL.origin);
		persistCookies(response.headers, resURL);
		return response;
	}

	function persistCookies (headers, url) {
		const cookieDirectives = headers['set-cookie'] ||
			headers.cookie?.split('; ');

		for (const cookieDirective of cookieDirectives || []) {
			cookieJar.setCookieSync(cookieDirective, url.href);
		}
	}

	function containRequests (url) {
		// TODO: find out how to clear interceptor
		nock(url.origin)
			.get(/.*/)
			.reply(function forwardToApp (path, body, callback) {
				agent[this.req.method.toLowerCase()](path)
					.set(this.req.headers)
					.then(res => callback(null, [ res.status, res.text, res.headers ]))
					.catch(callback);
			})
			.persist();
	}

	function load (response, jsdomConfig = {}) {
		return new jsdom.JSDOM(response.text, {
			url: resURL?.href,
			...jsdomConfig,
			contentType: response.headers.contentType,
			cookieJar,
			runScripts: 'outside-only',
		});
	}
}

function resolveURL (url, origin) {
	return new URL(url, origin || 'http://localhost:7411');
}
