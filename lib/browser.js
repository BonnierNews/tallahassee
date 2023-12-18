'use strict';

const http = require('http');
const https = require('https');
const jsdom = require('jsdom');
const nock = require('nock');

const httpVerbs = [ 'DELETE', 'GET', 'HEAD', 'MERGE', 'OPTIONS', 'PATCH', 'POST', 'PUT' ];

module.exports = class Browser {
	constructor (origin, cookieJar) {
		this.origin = origin;
		this.cookieJar = cookieJar || new jsdom.CookieJar();
	}

	async navigateTo (url, headers, jsdomConfig = {}) {
		url = new URL(url, this.origin);
		if (headers)
			this.#persistCookies(headers, url);

		const response = await this.request(url, { headers, credentials: true });
		// TODO: test redirection responses
		// if (response.headers.location)
		// 	url = new URL(response.headers.location, url.origin);
		return new jsdom.JSDOM(response.body, {
			runScripts: 'outside-only',
			...jsdomConfig,
			url,
			contentType: response.headers.contentType,
			cookieJar: this.cookieJar,
			beforeParse: window => {
				// interceptXMLHttpRequests(this, window);
				jsdomConfig.resources?.beforeParse?.(window);
				jsdomConfig.beforeParse?.(window);
			}
		});
	}

	async request (url, options, body) {
		const { method = 'get', headers = {}, credentials } = options;
		if (credentials)
			headers.cookie = this.cookieJar.getCookieStringSync(url.href);

		const response = await request(url, { method, headers, body });
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

class ReverseProxy {
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

		request(new URL(path, this.upstreamOrigin), { method, headers, body })
			.then(res => callback(null, [ res.statusCode, res.body, res.headers ]))
			.catch(callback);
	}
}

module.exports.ReverseProxy = ReverseProxy;
module.exports.request = request;

function request (url, { body: reqBody, ...options }) {
	return new Promise((resolve, reject) => {
		url = new URL(url);
		const h = url.protocol === 'https:' ? https : http;
		const req = h.request(url, options, onResponse);
		req.on('error', reject);
		if (reqBody) req.write(reqBody);
		req.end();

		function onResponse (res) {
			const { statusCode, headers } = res;
			if (statusCode >= 300 && statusCode < 400)
				return request(new URL(headers.location, url.origin), options)
					.then(resolve)
					.catch(reject);

			let resBody = '';
			res.on('data', chunk => resBody += chunk.toString());
			res.on('end', () => resolve({ statusCode, headers, body: resBody }));
		}
	});
}
