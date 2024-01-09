'use strict';

const { Browser, Painter, Resources } = require('../../../index.js');
const { strict: assert } = require('assert');
const server = require('./server.js');
const setup = require('../helpers/setup.js');

Feature('lazy load', () => {
	const pendingServerOrigin = setup(server);

	let painter, resources, dom;
	before('load page', async () => {
		painter = Painter();
		resources = new Resources();

		const origin = await pendingServerOrigin;
		dom = await new Browser(origin)
			.navigateTo('/', {}, {
				beforeParse (window) {
					painter.init(window);
				}
			});
	});

	let images;
	Given('three images', () => {
		images = dom.window.document.getElementsByTagName('img');
		assert.equal(images.length, 3);
	});

	And('they are not loaded', () => {
		for (const image of images) {
			assert.equal(image.getAttribute('src'), '/placeholder.gif');
		}
	});

	And('only the first one is located within the viewport', () => {
		for (let i = 0; i < images.length; ++i) {
			painter.paint(images[i], { y: i * 2 * dom.window.innerHeight });
		}
	});

	When('scripts are executed', async () => {
		await resources.runScripts(dom);
	});

	Then('the first image is loaded', () => {
		for (let i = 0; i < 1; ++i) {
			const image = images[i];
			assert.equal(image.getAttribute('src'), `/image-${i + 1}.avif`);
		}
	});

	But('the other aren\'t', () => {
		for (let i = 1; i < images.length; ++i) {
			const image = images[i];
			assert.equal(image.getAttribute('src'), '/placeholder.gif');
		}
	});

	When('the document is scrolled', async () => {
		dom.window.scroll(0, 1);
	});

	Then('status is unchanged', () => {
		for (let i = 1; i < images.length; ++i) {
			const image = images[i];
			assert.equal(image.getAttribute('src'), '/placeholder.gif');
		}
	});

	When('the second image is scrolled into view', async () => {
		images[1].scrollIntoView();
	});

	Then('the second image is loaded', () => {
		for (let i = 0; i < 2; ++i) {
			const image = images[i];
			assert.equal(image.getAttribute('src'), `/image-${i + 1}.avif`);
		}
	});

	But('the other aren\'t', () => {
		for (let i = 2; i < images.length; ++i) {
			const image = images[i];
			assert.equal(image.getAttribute('src'), '/placeholder.gif');
		}
	});
});