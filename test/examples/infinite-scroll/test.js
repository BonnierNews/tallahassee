'use strict';

const { Browser, Painter, Resources } = require('../../../index.js');
const { strict: assert } = require('assert');
const server = require('./server.js');
const setup = require('../helpers/setup.js');

Feature('infinite scroll', () => {
	const pendingServerOrigin = setup(server);

	let painter, resources, dom;
	before('load page', async () => {
		painter = new Painter();
		resources = new Resources();

		const origin = await pendingServerOrigin;
		dom = await new Browser(origin)
			.navigateTo('/', {}, {
				resources,
				beforeParse (window) {
					painter.init(window);
				}
			});
	});

	let articles;
	Given('one article', () => {
		articles = dom.window.document.getElementsByTagName('article');
		assert.equal(articles.length, 1);
		painter.paint(dom.window, { scrollHeight: Infinity });
		painter.paint('article', { height: dom.window.innerHeight * 2 });
	});

	When('scripts are executed', async () => {
		await resources.runScripts(dom);
	});

	let resolvePendingInsertion;
	And('mutations to body are monitored', () => {
		const observer = new dom.window.MutationObserver(() => resolvePendingInsertion());
		observer.observe(dom.window.document.body, { childList: true });
	});

	let pendingInsertion;
	And('document is scrolled towards the end of the article', () => {
		pendingInsertion = new Promise(resolve => resolvePendingInsertion = resolve);
		const { bottom: articleBottom } = articles[0].getBoundingClientRect();
		dom.window.scroll(0, articleBottom - (dom.window.innerHeight / 2));
	});

	Then('a second article is appended', async () => {
		await pendingInsertion;
		assert.equal(articles.length, 2);
		const { bottom: previousArticleBottom } = articles[0].getBoundingClientRect();
		painter.paint(articles[1], { y: previousArticleBottom });
	});

	When('document is scrolled towards the end of the second article', () => {
		pendingInsertion = new Promise(resolve => resolvePendingInsertion = resolve);
		const { bottom: articleBottom } = articles[1].getBoundingClientRect();
		dom.window.scroll(0, articleBottom - (dom.window.innerHeight / 2));
	});

	Then('a third article is appended', async () => {
		await pendingInsertion;
		assert.equal(articles.length, 3);
	});
});
