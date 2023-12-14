'use strict';

const jsdom = require('jsdom');
const nock = require('nock');
const supertest = require('supertest');

const httpVerbs = [ 'DELETE', 'GET', 'HEAD', 'MERGE', 'OPTIONS', 'PATCH', 'POST', 'PUT' ];

module.exports = class Browser {
	constructor (app, cookieJar) {
		this.app = app;
		this.cookieJar = cookieJar || new jsdom.CookieJar();
	}

	async navigateTo (url, headers, jsdomConfig = {}) {
		url = new URL(url, 'http://localhost:7411');
		if (headers)
			this.#persistCookies(headers, url);

		const response = await this.request(url, { headers, credentials: true });
		// TODO: test redirection responses
		if (response.headers.location)
			url = new URL(response.headers.location, url.origin);

		return new jsdom.JSDOM(response.text, {
			runScripts: 'outside-only',
			...jsdomConfig,
			url,
			contentType: response.headers.contentType,
			cookieJar: this.cookieJar,
			beforeParse: window => {
				interceptXMLHttpRequests(this, window);
				jsdomConfig.beforeParse?.(window);
			}
		});
	}

	async request (url, options, body) {
		const { method = 'GET', headers = {}, credentials } = options;
		if (credentials)
			headers.cookie = this.cookieJar.getCookieStringSync(url.href);

		const path = url.pathname + url.search;
		const pendingRequest = supertest(this.app)[method.toLowerCase()](path)
			.set(headers);
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
};

module.exports.ReverseProxy = class ReverseProxy {
	#interceptors = [];

	constructor (proxyOrigin, upstreamOrigin, headers = {}) {
		this.upstreamOrigin = upstreamOrigin;
		this.headers = headers;

		const proxy = this;
		for (const verb of httpVerbs) {
			const interceptor = nock(proxyOrigin)
				.persist()
				.intercept(/.*/, verb);
			interceptor.reply(function (path, body, callback) {
				proxy.#forward.call(proxy, this.req, path, body, callback);
			});
			this.#interceptors.push(interceptor);
		}
	}

	clear () {
		for (const interceptor of this.#interceptors)
			nock.removeInterceptor(interceptor);
	}

	#forward (req, path, body, callback) {
		const { method, headers: reqHeaders } = req;
		const headers = { ...this.headers, ...reqHeaders };
		const pendingRequest = supertest(this.upstreamOrigin)[method.toLowerCase()](path)
			.set(headers);
		if (body)
			pendingRequest.send(body);

		pendingRequest
			.then(res => callback(null, [ res.status, res.text, res.headers ]))
			.catch(callback);
	}
};

function interceptXMLHttpRequests (browser, window) {
	const { origin } = window.location;
	window.XMLHttpRequest = class XMLHttpRequestInterceptor extends window.XMLHttpRequest {
		open (method, url, ...args) {
			url = new URL(url, origin);
			if (url.origin === origin) {
				this.#intercept(method, url);
			}

			return super.open(method, url, ...args);
		}

		#intercept (method, url) {
			nock(origin)
				.intercept(url.pathname, method)
				.reply(this.#forwardToApp);
		}

		#forwardToApp (path, body, callback) {
			const url = new URL(path, origin);
			const { method, headers } = this.req;

			browser.request(url, { method, headers }, body)
				.then(res => callback(null, [ res.status, res.text, res.headers ]))
				.catch(callback);
		}
	};
}
