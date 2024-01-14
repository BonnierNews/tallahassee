'use strict';

const specificity = require('specificity');

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
		this.paint(window, { width: innerWidth, height: innerHeight });

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

			if (parent) {
				this.renderTree.set(target, parent);
			}
		}

		return this;
	}

	getLayout (source, relative) {
		const compoundedStyles = [
			...this.cascadingStyles.getMatchingStyles(source),
			this.elementStyles.get(source),
		]
			.filter(Boolean)
			.reduce((compounded, current) => {
				return Object.assign(compounded, current);
			}, {});

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

		return new Layout(compoundedStyles);
	}

	#getAncestors (element) {
		const ancestors = [];
		let parent = element;
		while ((parent = this.renderTree.get(parent))) {
			ancestors.push(parent);
		}
		return ancestors.concat(this.window);
	}

	#requireElementStyles (element) {
		if (!this.elementStyles.has(element)) {
			this.elementStyles.set(element, {});
			this.renderTree.set(element, { parent: null, children: [] });
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
		Painter.#scrollBy.call(this.ownerDocument.defaultView, painter, x, y);
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
