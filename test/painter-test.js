'use strict';

const Painter = require('../lib/painter.js');
const pick = require('lodash.pick');
const { JSDOM } = require('jsdom');
const { strict: assert } = require('assert');

describe('Painter', () => {
	describe('Web APIs', () => {
		let dom, window, element;
		beforeEach('load DOM', () => {
			dom = new JSDOM('<div>HTMLElement</div>', { runScripts: 'outside-only' });
			window = dom.window;
			element = window.document.querySelector('div');
		});

		let painter;
		beforeEach('initialize painter', () => {
			painter = Painter().init(window);
		});

		beforeEach('paint non-default scroll position', () => {
			painter.paint(window, {
				scrollX: 20,
				scrollY: 10,
			});
		});

		beforeEach('paint non-default layout', () => {
			painter.paint(element, {
				x: 50,
				y: 20,
				width: 150,
				height: 250,
				scrollWidth: 140,
				scrollHeight: 300,
				scrollX: 20,
				scrollY: 10,
			});
		});

		describe('Element', () => {
			beforeEach('is instance of Element', () => {
				assert.equal(element instanceof dom.window.Element, true, 'expected instance of Element');
			});

			it('.scrollWidth', () => {
				assert.equal(element.scrollWidth, 150);
			});

			it('.scrollHeight', () => {
				assert.equal(element.scrollHeight, 300);
			});

			it('.scrollLeft', () => {
				assert.equal(element.scrollLeft, 20);
			});

			it('.scrollTop', () => {
				assert.equal(element.scrollTop, 10);
			});

			it('.getBoundingClientRect()', () => {
				assert.deepEqual(element.getBoundingClientRect(), {
					width: 150,
					height: 250,
					x: 30,
					y: 10,
					left: 30,
					right: 180,
					top: 10,
					bottom: 260,
				});
			});

			it('.scroll(x-coord, y-coord)', () => {
				const pendingScroll = new Promise(r =>
					element.addEventListener('scroll', r, { once: true })
				);

				element.scroll(30, 60);
				assert.equal(element.scrollLeft, 30);
				assert.equal(element.scrollTop, 60);

				return pendingScroll;
			});

			it('.scroll(options)', () => {
				const pendingScroll = new Promise(r =>
					element.addEventListener('scroll', r, { once: true })
				);

				element.scroll({ left: 30, top: 60 });
				assert.equal(element.scrollLeft, 30);
				assert.equal(element.scrollTop, 60);

				return pendingScroll;
			});

			it('.scrollTo(x-coord, y-coord)', () => {
				const pendingScroll = new Promise(r =>
					element.addEventListener('scroll', r, { once: true })
				);

				element.scrollTo(30, 60);
				assert.equal(element.scrollLeft, 30);
				assert.equal(element.scrollTop, 60);

				return pendingScroll;
			});

			it('.scrollTo(options)', () => {
				const pendingScroll = new Promise(r =>
					element.addEventListener('scroll', r, { once: true })
				);

				element.scrollTo({ left: 30, top: 60 });
				assert.equal(element.scrollLeft, 30);
				assert.equal(element.scrollTop, 60);

				return pendingScroll;
			});

			it('.scrollBy(x-coord, y-coord)', () => {
				const pendingScroll = new Promise(r =>
					element.addEventListener('scroll', r, { once: true })
				);

				element.scrollBy(10, 10);
				assert.equal(element.scrollLeft, 30);
				assert.equal(element.scrollTop, 20);

				return pendingScroll;
			});

			it('.scrollBy(options)', () => {
				const pendingScroll = new Promise(r =>
					element.addEventListener('scroll', r, { once: true })
				);

				element.scrollBy({ left: 10, top: 10 });
				assert.equal(element.scrollLeft, 30);
				assert.equal(element.scrollTop, 20);

				return pendingScroll;
			});
		});

		describe('HTMLElement', () => {
			beforeEach('is instance of HTMLElement', () => {
				assert.equal(element instanceof dom.window.HTMLElement, true, 'expected instance of HTMLElement');
			});

			it('.offsetWidth', () => {
				assert.equal(element.offsetWidth, 150);
			});

			it('.offsetHeight', () => {
				assert.equal(element.offsetHeight, 250);
			});

			it('.offsetLeft', () => {
				assert.equal(element.offsetLeft, 50);
			});

			it('.offsetTop', () => {
				assert.equal(element.offsetTop, 20);
			});
		});

		describe('Window', () => {
			beforeEach('paint non-default viewport', () => {
				painter.paint(window, {
					width: 900,
					height: 1600,
				});
			});

			it('.innerWidth', () => {
				assert.equal(window.innerWidth, 900);
			});

			it('.innerHeight', () => {
				assert.equal(window.innerHeight, 1600);
			});

			it('.scrollX', () => {
				assert.equal(window.scrollX, 20);
			});

			it('.scrollY', () => {
				assert.equal(window.scrollY, 10);
			});

			it('.pageXOffset', () => {
				assert.equal(window.pageXOffset, 20);
			});

			it('.pageYOffset', () => {
				assert.equal(window.pageYOffset, 10);
			});

			it('.scroll(x-coord, y-coord)', () => {
				const pendingScroll = new Promise(r =>
					window.addEventListener('scroll', r, { once: true })
				);

				window.scroll(30, 60);
				assert.equal(window.scrollX, 30);
				assert.equal(window.scrollY, 60);
				assert.equal(window.pageXOffset, 30);
				assert.equal(window.pageYOffset, 60);

				return pendingScroll;
			});

			it('.scroll(options)', () => {
				const pendingScroll = new Promise(r =>
					window.addEventListener('scroll', r, { once: true })
				);

				window.scroll({ left: 30, top: 60 });
				assert.equal(window.scrollX, 30);
				assert.equal(window.scrollY, 60);
				assert.equal(window.pageXOffset, 30);
				assert.equal(window.pageYOffset, 60);

				return pendingScroll;
			});

			it('.scrollTo(x-coord, y-coord)', () => {
				const pendingScroll = new Promise(r =>
					window.addEventListener('scroll', r, { once: true })
				);

				window.scrollTo(30, 60);
				assert.equal(window.scrollX, 30);
				assert.equal(window.scrollY, 60);
				assert.equal(window.pageXOffset, 30);
				assert.equal(window.pageYOffset, 60);

				return pendingScroll;
			});

			it('.scrollTo(options)', () => {
				const pendingScroll = new Promise(r =>
					window.addEventListener('scroll', r, { once: true })
				);

				window.scrollTo({ left: 30, top: 60 });
				assert.equal(window.scrollX, 30);
				assert.equal(window.scrollY, 60);
				assert.equal(window.pageXOffset, 30);
				assert.equal(window.pageYOffset, 60);

				return pendingScroll;
			});

			it('.scrollBy(x-coord, y-coord)', () => {
				const pendingScroll = new Promise(r =>
					window.addEventListener('scroll', r, { once: true })
				);

				window.scrollBy(10, 10);
				assert.equal(window.scrollX, 30);
				assert.equal(window.scrollY, 20);
				assert.equal(window.pageXOffset, 30);
				assert.equal(window.pageYOffset, 20);

				return pendingScroll;
			});

			it('.scrollBy(options)', () => {
				const pendingScroll = new Promise(r =>
					window.addEventListener('scroll', r, { once: true })
				);

				window.scrollBy({ left: 10, top: 10 });
				assert.equal(window.scrollX, 30);
				assert.equal(window.scrollY, 20);
				assert.equal(window.pageXOffset, 30);
				assert.equal(window.pageYOffset, 20);

				return pendingScroll;
			});
		});
	});

	describe('scrolling', () => {
		let dom, window, ancestorElement, parentElement, childElements;
		beforeEach('load DOM', () => {
			dom = new JSDOM(`
				<article>
					<div>
						<img>
						<img>
					</div>
				</article>
			`, { runScripts: 'outside-only' });
			window = dom.window;
			ancestorElement = window.document.querySelector('article');
			parentElement = ancestorElement.firstElementChild;
			childElements = parentElement.children;
		});

		let painter;
		beforeEach('initialize painter', () => {
			painter = Painter().init(window);
		});

		beforeEach('paint layout', () => {
			painter.paint(ancestorElement, { width: 400, y: 50 });
			painter.paint(parentElement, { width: 400, y: 70 }, ancestorElement);
			painter.paint(childElements[0], { x: 0, width: 400, y: 70 }, parentElement);
			painter.paint(childElements[1], { x: 400, width: 400, y: 70 }, parentElement);
		});

		it('scrolling window paints descendants', () => {
			dom.window.scrollTo(0, 50);

			assert.deepEqual(
				pick(ancestorElement.getBoundingClientRect(), 'x', 'y'),
				{ x: 0, y: 0 }
			);
			assert.deepEqual(
				pick(parentElement.getBoundingClientRect(), 'x', 'y'),
				{ x: 0, y: 20 }
			);
			assert.deepEqual(
				pick(childElements[0].getBoundingClientRect(), 'x', 'y'),
				{ x: 0, y: 20 }
			);
			assert.deepEqual(
				pick(childElements[1].getBoundingClientRect(), 'x', 'y'),
				{ x: 400, y: 20 }
			);
		});

		it('scrolling ancestor paints descendants', () => {
			ancestorElement.scrollTo(0, 50);
			parentElement.scrollTo(400, 0);

			assert.deepEqual(
				pick(ancestorElement.getBoundingClientRect(), 'x', 'y'),
				{ x: 0, y: 50 }
			);
			assert.deepEqual(
				pick(parentElement.getBoundingClientRect(), 'x', 'y'),
				{ x: 0, y: 20 }
			);
			assert.deepEqual(
				pick(childElements[0].getBoundingClientRect(), 'x', 'y'),
				{ x: -400, y: 20 }
			);
			assert.deepEqual(
				pick(childElements[1].getBoundingClientRect(), 'x', 'y'),
				{ x: 0, y: 20 }
			);
		});
	});

	describe('options.stylesheet', () => {
		before('defaults bounding box values to 0', async () => {
			const dom = new JSDOM('<div>HTMLElement</div>');
			Painter().init(dom.window);

			const element = dom.window.document.querySelector('div');
			assert.deepEqual(element.getBoundingClientRect(), {
				width: 0,
				height: 0,
				x: 0,
				y: 0,
				left: 0,
				right: 0,
				top: 0,
				bottom: 0,
			});
		});

		it('styles multiple elements', async () => {
			const dom = new JSDOM(`
        <div>HTMLElement</div>
        <div>HTMLElement</div>
      `);
			const stylesheet = {
				'*': { x: 50, y: 20, width: 150, height: 250 },
			};
			Painter({ stylesheet }).init(dom.window);

			const matchingElements = dom.window.document.querySelectorAll('*');
			for (const element of matchingElements) {
				assert.deepEqual(element.getBoundingClientRect(), {
					width: 150,
					height: 250,
					x: 50,
					y: 20,
					left: 50,
					right: 200,
					top: 20,
					bottom: 270,
				});
			}
		});

		it('compounds multiple matching styles', async () => {
			const dom = new JSDOM(`
        <h1>A heading</h1>
        <p>A paragraph…</p>
      `);
			const stylesheet = {
				'*': { width: 375 },
				'h1': { height: 36 },
				'p': { height: 160, y: 36 },
			};
			Painter({ stylesheet }).init(dom.window);

			const [ h1, p ] = dom.window.document.body.children;
			assert.deepEqual(h1.getBoundingClientRect(), {
				width: 375,
				height: 36,
				x: 0,
				y: 0,
				left: 0,
				right: 375,
				top: 0,
				bottom: 36,
			});
			assert.deepEqual(p.getBoundingClientRect(), {
				width: 375,
				height: 160,
				x: 0,
				y: 36,
				left: 0,
				right: 375,
				top: 36,
				bottom: 196,
			});
		});

		it('uses selector specificity to resolve conflicting styles', async () => {
			const dom = new JSDOM(`
        <h1 id="the-heading" class="heading">
          A heading
        </h1>
      `);
			const stylesheet = {
				'#the-heading': { height: 30 },
				'h1, h2': { height: 10 },
				'.heading': { height: 20 },
				'*': { height: 0 },
			};
			Painter({ stylesheet }).init(dom.window);

			const h1 = dom.window.document.body.querySelector('h1');
			assert.deepEqual(h1.offsetHeight, 30);
		});

		it('element styles trump stylesheet styles', async () => {
			const dom = new JSDOM(`
        <div id="element">HTMLElement</div>
      `);
			const stylesheet = {
				'#element': { width: 100, height: 100 },
			};
			const painter = Painter({ stylesheet }).init(dom.window);

			const element = dom.window.document.getElementById('element');
			painter.paint(element, { width: 200 });
			assert.deepEqual(element.offsetWidth, 200);
			assert.deepEqual(element.offsetHeight, 100);
		});
	});

	describe('.paint', () => {
		let painter, elements;
		beforeEach(() => {
			const dom = new JSDOM(`
        <div>HTMLElement</div>
      `);
			painter = Painter().init(dom.window);
			elements = dom.window.document.querySelectorAll('div');
		});

		it('paints element', () => {
			const [ element ] = elements;
			painter.paint(element, { height: 16, y: 10 });
			assert.equal(element.offsetHeight, 16);
			assert.equal(element.offsetTop, 10);
		});

		it('paints elements with selector', () => {
			painter.paint('div', { height: 16, y: 10 });
			for (const element of elements) {
				assert.equal(element.offsetHeight, 16);
				assert.equal(element.offsetTop, 10);
			}
		});

		it('repaints element, updating element styles', () => {
			const [ element ] = elements;
			painter.paint(element, { height: 16, y: 10 });
			assert.equal(element.offsetHeight, 16);
			assert.equal(element.offsetTop, 10);

			painter.paint(element, { height: 32 });
			assert.equal(element.offsetHeight, 32);
			assert.equal(element.offsetTop, 10);
		});

		it('repaints elements with selector, replacing stylesheet entry', () => {
			painter.paint('div', { height: 16, y: 10 });
			for (const element of elements) {
				assert.equal(element.offsetHeight, 16);
				assert.equal(element.offsetTop, 10);
			}

			painter.paint('div', { height: 32 });
			for (const element of elements) {
				assert.equal(element.offsetHeight, 32);
				assert.equal(element.offsetTop, 0);
			}
		});
	});
});
