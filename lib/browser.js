'use strict';

const jsdom = require('jsdom');
const nock = require('nock');
const supertest = require('supertest');

module.exports = class Browser {
	constructor (agentOrApp, cookieJar) {
		this.agent = agentOrApp.listen ?
			supertest.agent(agentOrApp) :
			agentOrApp;
		this.cookieJar = cookieJar || new jsdom.CookieJar();
	}

	async navigateTo (url, headers, jsdomConfig) {
		url = new URL(url, url.origin || 'http://localhost:7411');
		if (headers)
			this.#persistCookies(headers, url);

		const response = await this.request(url, { headers, credentials: true });
		// TODO: test redirection responses
		url = new URL(response.headers.location || url, url.origin);
		// TODO: put containRequests behind option?
		// TODO: setup single nock per call to XMLHttpRequest?
		this.#containRequests(url.origin);
		return new jsdom.JSDOM(response.text, {
			...jsdomConfig,
			url,
			contentType: response.headers.contentType,
			cookieJar: this.cookieJar,
			runScripts: 'outside-only',
		});
	}

	async request (url, options) {
		const {
			method = "GET",
			headers = {},
			body,
			credentials = false,
		} = options;

		const pendingRequest = this.agent[method.toLowerCase()](url.pathname)
			.set({
				...headers,
				cookie: credentials ?
					this.cookieJar.getCookieStringSync(url.href) :
					undefined,
			});
		if (body)
			pendingRequest.send(body);

		const response = await pendingRequest;
		if (response.headers.location)
			url = new URL(response.headers.location, url.origin);
		if (credentials)
			this.#persistCookies(response.headers, url);

		return response;
	}

	#persistCookies (headers, url) {
		const cookieDirectives = headers['set-cookie'] ||
			headers.cookie?.split('; ');

		for (const cookieDirective of cookieDirectives || []) {
			this.cookieJar.setCookieSync(cookieDirective, url.href);
		}
	}

	#containRequests (origin) {
		const browser = this;
		// TODO: find out how to clear specific scope
		nock(origin)
			// TODO: intercept all verbs?
			.get(/.*/)
			.reply(function forwardToApp (path, body, callback) {
				const { method, headers } = this.req;
				browser.request(new URL(path, origin), { method, headers, body })
					.then(res => callback(null, [ res.status, res.text, res.headers ]))
					.catch(callback);
			})
			.persist();
	}
};
