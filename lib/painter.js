'use strict';

const specificity = require('specificity');


const sides = [ 'width', 'height' ];
const scrollSides = [ 'scrollWidth', 'scrollHeight' ];
const allSides = [].concat(sides, scrollSides);
const sideByScrollSide = Object.fromEntries(
	scrollSides.map((s, i) => [ s, sides[i] ])
);
const axes = [ 'x', 'y' ];
const sideByAxis = Object.fromEntries(
	axes.map((a, i) => [ a, sides[i] ])
);
const axisBySide = Object.fromEntries(
	sides.map((s, i) => [ s, axes[i] ])
);

class Layout {
	width = 0;
	height = 0;
	scrollWidth = 0;
	scrollHeight = 0;
	x = 0;
	y = 0;
	scrollX = 0;
	scrollY = 0;

	constructor (styles = {}) {
		for (const key of Object.keys(this)) {
			this[key] = styles[key] ?? this[key];
		}
		this.scrollWidth = Math.max(this.width, this.scrollWidth);
		this.scrollHeight = Math.max(this.height, this.scrollHeight);
		this.scrollX = Math.min(this.scrollX, this.scrollWidth - this.width);
		this.scrollY = Math.min(this.scrollY, this.scrollHeight - this.height);
		this.left = Math.min(this.x, this.x + this.width); // move to getBoundingClientRect()?
		this.right = Math.max(this.x + this.width, this.x); // move to getBoundingClientRect()?
		this.top = Math.min(this.y, this.y + this.height); // move to getBoundingClientRect()?
		this.bottom = Math.max(this.y + this.height, this.y); // move to getBoundingClientRect()?
		Object.preventExtensions(this);
	}
}

class Stylesheet {
	rules = [];
	ruleSheet = {};

	constructor (...ruleSets) {
		this.add(...ruleSets);
	}

	add (...ruleSets) {
		Object.assign(this.ruleSheet, ...ruleSets);
		this.rules.length = 0;

		for (const [ selectorList, styles ] of Object.entries(this.ruleSheet)) {
			for (const selector of selectorList.split(',')) {
				this.rules.push([ selector, styles ]);
			}
		}
	}

	getMatchingStyles (element) {
		if (!element.nodeName) return [];
		return this.rules
			.filter(([ selector ]) => element.matches(selector))
			.map(([ selector, styles ]) => [ specificity.calculate(selector), styles ])
			.sort(([ selA ], [ selB ]) => specificity.compare(selA, selB))
			.map(([ , styles ]) => styles);
	}
}

class Painter {
	cascadingStyles = new Stylesheet();
	elementStyles = new Map();
	renderTree = new Map();
	window;

	constructor (options = {}) {
		if (options.stylesheet)
			this.cascadingStyles.add(options.stylesheet);
	}

	init (window) {
		this.window = window;

		const { innerWidth, innerHeight } = window;
		this.paint(window, { width: innerWidth, height: innerHeight, scrollHeight: 'auto' }, null);

		Object.defineProperties(window, {
			innerWidth: { get: forward(Painter.#getDomRect, this, 'width', false, window) },
			innerHeight: { get: forward(Painter.#getDomRect, this, 'height', false, window) },
			scrollX: { get: forward(Painter.#getDomRect, this, 'scrollX', false, window) },
			scrollY: { get: forward(Painter.#getDomRect, this, 'scrollY', false, window) },
			pageXOffset: { get: forward(Painter.#getDomRect, this, 'scrollX', false, window) },
			pageYOffset: { get: forward(Painter.#getDomRect, this, 'scrollY', false, window) },
			scroll: { value: forward(Painter.#scrollTo, this) },
			scrollTo: { value: forward(Painter.#scrollTo, this) },
			scrollBy: { value: forward(Painter.#scrollBy, this) },
		});
		Object.defineProperties(window.Element.prototype, {
			scrollWidth: { get: forward(Painter.#getDomRect, this, 'scrollWidth') },
			scrollHeight: { get: forward(Painter.#getDomRect, this, 'scrollHeight') },
			scrollLeft: { get: forward(Painter.#getDomRect, this, 'scrollX') },
			scrollTop: { get: forward(Painter.#getDomRect, this, 'scrollY') },
			scroll: { value: forward(Painter.#scrollTo, this) },
			scrollTo: { value: forward(Painter.#scrollTo, this) },
			scrollBy: { value: forward(Painter.#scrollBy, this) },
			scrollIntoView: { value: forward(Painter.#scrollIntoView, this) },
			getBoundingClientRect: { value: forward(Painter.#getDomRect, this, [ 'width', 'height', 'x', 'y', 'left', 'right', 'top', 'bottom' ], true) },
		});
		Object.defineProperties(window.HTMLElement.prototype, {
			offsetWidth: { get: forward(Painter.#getDomRect, this, 'width') },
			offsetHeight: { get: forward(Painter.#getDomRect, this, 'height') },
			offsetLeft: { get: forward(Painter.#getDomRect, this, 'x') },
			offsetTop: { get: forward(Painter.#getDomRect, this, 'y') },
		});

		return this;
	}

	paint (target, styleChanges, parent) {
		if (typeof target === 'string') {
			this.cascadingStyles.add({ [target]: styleChanges });
		}
		else {
			const styles = this.#requireElementStyles(target);
			Object.assign(styles, styleChanges);
		}

		if (parent) this.link(target, parent);

		return this;
	}

	link (child, parent) {
		if (child.nodeName) {
			this.renderTree.get(child).parent = parent;
		}
		this.renderTree.get(parent).children.push(child);
	}

	getLayout (source, relative, cache, accumulated) {
		cache = cache || new Map();
		if (cache.has(source)) return cache.get(source);

		const compoundedStyles = [
			...this.cascadingStyles.getMatchingStyles(source),
			this.elementStyles.get(source),
		]
			.filter(Boolean)
			.reduce((compounded, current) => {
				return Object.assign(compounded, current);
			}, {});

		const autoAxes = axes.filter(a => compoundedStyles[a] === 'auto');
		if (autoAxes.length) {
			if (accumulated) {
				for (const a of autoAxes) compoundedStyles[a] = accumulated[a];
			}
			else {
				const stack = Object.fromEntries(autoAxes.map(a => [ a, 0 ]));
				const siblings = this.renderTree.get(source)?.parent?.children;

				for (const e of siblings || []) {
					if (e === source) break;

					const cs = this.getLayout(e, false, cache, stack);
					for (const a of autoAxes) {
						stack[a] = Math.max(stack[a], (cs[a] || 0) + (cs[sideByAxis[a]] || 0));
					}
				}

				Object.assign(compoundedStyles, stack);
			}
		}

		const autoSides = allSides.filter(s => compoundedStyles[s] === 'auto');
		if (autoSides.length) {
			const stack = Object.fromEntries(autoSides.map(s => [ s, 0 ]));
			const children = this.#getChildElements(source);

			if (Object.hasOwn(stack, 'width')) delete stack.scrollWidth;
			if (Object.hasOwn(stack, 'height')) delete stack.scrollHeight;

			for (const e of children) {
				const cs = this.getLayout(e, false, cache);
				for (const s of Object.keys(stack)) {
					const cside = sideByScrollSide[s] || s;
					stack[s] = Math.max(stack[s], (cs[axisBySide[cside]] || 0) + (cs[cside] || 0));
				}
			}

			Object.assign(compoundedStyles, stack);
		}

		if (relative) {
			this.#getAncestors(source)
				.map(ancestor => this.elementStyles.get(ancestor))
				.filter(Boolean)
				.reduce((styles, ancestorStyles) => {
					return Object.assign(styles, {
						x: (styles.x || 0) - (ancestorStyles.scrollX || 0),
						y: (styles.y || 0) - (ancestorStyles.scrollY || 0),
					});
				}, compoundedStyles);
		}

		const layout = new Layout(compoundedStyles);
		cache.set(source, layout);
		return layout;
	}

	#getChildElements (element) {
		const children = new Set(
			this.renderTree.get(element).children
				.map(c => typeof c === 'string' ? Array.from((element.document || element).querySelectorAll(c)) : c)
				.flat()
		);

		for (const child of children) {
			this.#requireElementStyles(child, element);
		}

		return children;
	}

	#getAncestors (element) {
		const ancestors = [];
		let parent = element;
		while ((parent = this.renderTree.get(parent)?.parent)) {
			ancestors.push(parent);
		}
		return ancestors.concat(this.window);
	}

	#requireElementStyles (element, parent = null) {
		if (!this.elementStyles.has(element)) {
			this.elementStyles.set(element, {});
			this.renderTree.set(element, { parent, children: [] });
		}

		return this.elementStyles.get(element);
	}

	static #scrollTo (painter, scrollX, scrollY) {
		if (typeof scrollX === 'object') {
			({ left: scrollX, top: scrollY } = scrollX);
		}

		painter.paint(this, { scrollX, scrollY });

		// const Event = this.nodeName ? this.ownerDocument.defaultView.Event : window.Event;
		this.dispatchEvent(new painter.window.Event('scroll'));
	}

	static #scrollBy (painter, scrollXDelta, scrollYDelta) {
		if (typeof scrollXDelta === 'object') {
			({ left: scrollXDelta, top: scrollYDelta } = scrollXDelta);
		}

		const layout = painter.getLayout(this);
		const scrollX = layout.scrollX + scrollXDelta;
		const scrollY = layout.scrollY + scrollYDelta;
		Painter.#scrollTo.call(this, painter, scrollX, scrollY);
	}

	static #scrollIntoView (painter) {
		const { x, y } = painter.getLayout(this);
		Painter.#scrollTo.call(this.ownerDocument.defaultView, painter, x, y);
	}

	static #getDomRect (painter, props, relative, self) {
		const layout = painter.getLayout(self || this, relative);
		if (typeof props === 'string') return layout[props];
		return props.reduce((rect, prop) => {
			rect[prop] = layout[prop];
			return rect;
		}, {});
	}
}

module.exports = Painter;
module.exports.Layout = Layout;

function forward (fn, ...forwarded) {
	return function (...args) {
		return Reflect.apply(fn, this, [ ...forwarded, ...args ]);
	};
}
