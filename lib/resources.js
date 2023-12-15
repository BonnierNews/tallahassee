'use strict';

const fsSync = require('fs');
const jsdom = require('jsdom');
const path = require('path');
const vm = require('vm');

const fs = fsSync.promises;

module.exports = class ResourceLoader extends jsdom.ResourceLoader {
	constructor (options = {}, ...args) {
		super(...args);
		this.options = options;
	}

	resolveTag (tag) {
		const attrs = this.options.resolveTag?.(tag);

		switch (typeof attrs) {
			case 'string':
				return { src: attrs, type: 'module' };
			case 'object':
				return attrs && {
					src: attrs.src || tag.src,
					type: attrs.type || tag.type,
				};
			default:
				return { src: tag.src, type: tag.type };
		}
	}

	async runScripts (dom, { noModule = false } = {}) {
		const domContext = dom.getInternalVMContext();

		for (const element of dom.window.document.getElementsByTagName('script')) {
			const attrs = this.resolveTag(element);
			if (attrs === null) continue;
			if (![ 'module', 'text/javascript', '' ].includes(attrs.type)) continue;
			if ((attrs.type === 'module') && noModule) continue;

			const src = attrs.src && new URL(attrs.src, dom.window.location);
			const code = src ?
				await this.fetch(src.href, {
					element,
					cookieJar: dom.cookieJar,
					referrer: dom.window.location,
				}) :
				element.text;
			if (!code) continue;

			const entryModule = await Module(code, domContext, src.pathname);
			await entryModule.evaluate();
		}
	}

	beforeParse (window) {
		return ResourceLoader.polyfill(window);
	}

	static polyfill (window) {
		for (const p of [ 'whatwg-fetch' ]) {
			const code = fsSync.readFileSync(require.resolve(p), 'utf8');
			window.eval(code);
		}
	}
};

async function Module (pendingCode, context, identifier) {
	const code = await pendingCode;
	const mod = new vm.SourceTextModule(code.toString(), {
		context,
		identifier,
		importModuleDynamically: link,
	});
	await mod.link(link);
	return mod;
}

async function link (specifier, referencingModule) {
	const childPath = path.resolve(path.dirname(referencingModule.identifier), specifier);
	// if (!childPath.endsWith(".mjs"))
	//   childPath = childPath + ".js";
	return Module(fs.readFile(childPath), referencingModule.context, childPath);
}
