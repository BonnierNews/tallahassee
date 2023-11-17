'use strict';

const specificity = require('specificity');

module.exports = function Painter (options = {}) {
	const cascadingStyles = Styles(options.stylesheet);
	const elementStyles = new Map();
	const elementParents = new Map();
	let window;

	return {
		init,
		paint,
	};

	function init (_window) {
		window = _window;
		const { innerWidth, innerHeight } = window;
		paint(window, { width: innerWidth, height: innerHeight });

		Object.defineProperties(window, {
			innerWidth: { get: GetDomRect('width', false, window) },
			innerHeight: { get: GetDomRect('height', false, window) },
			scrollX: { get: GetDomRect('scrollX', false, window) },
			scrollY: { get: GetDomRect('scrollY', false, window) },
			pageXOffset: { get: GetDomRect('scrollX', false, window) },
			pageYOffset: { get: GetDomRect('scrollY', false, window) },
			scroll: { value: scrollTo },
			scrollTo: { value: scrollTo },
			scrollBy: { value: scrollBy },
		});
		Object.defineProperties(window.Element.prototype, {
			getBoundingClientRect: { value: GetDomRect([ 'width', 'height', 'x', 'y', 'left', 'right', 'top', 'bottom' ], true) },
			scrollLeft: { get: GetDomRect('scrollX') },
			scrollTop: { get: GetDomRect('scrollY') },
			scroll: { value: scrollTo },
			scrollTo: { value: scrollTo },
			scrollBy: { value: scrollBy },
			scrollIntoView: { value: scrollIntoView },
		});
		Object.defineProperties(window.HTMLElement.prototype, {
			offsetWidth: { get: GetDomRect('width') },
			offsetHeight: { get: GetDomRect('height') },
			offsetLeft: { get: GetDomRect('x') },
			offsetTop: { get: GetDomRect('y') },
		});

		return this;
	}

	function paint (target, styleChanges) {
		if (typeof target === 'string') {
			cascadingStyles.add({ [target]: styleChanges });
		}
		else {
			const styles = requireElementStyles(target);
			Object.assign(styles, styleChanges);
		}

		return this;
	}

	function scrollTo (scrollX, scrollY) {
		if (typeof scrollX === 'object') {
			({ left: scrollX, top: scrollY } = scrollX);
		}

		paint(this, { scrollX, scrollY });

		const Event = this.nodeName ? this.ownerDocument.defaultView.Event : window.Event;
		this.dispatchEvent(new Event('scroll'));
	}

	function scrollBy (scrollXDelta, scrollYDelta) {
		if (typeof scrollXDelta === 'object') {
			({ left: scrollXDelta, top: scrollYDelta } = scrollXDelta);
		}

		const layout = getLayout(this);
		const scrollX = layout.scrollX + scrollXDelta;
		const scrollY = layout.scrollY + scrollYDelta;
		scrollTo.call(this, scrollX, scrollY);
	}

	function scrollIntoView () {
		const { x, y } = getLayout(this);
		scrollBy.call(this.ownerDocument.defaultView, x, y);
	}

	function GetDomRect (props, relative, self) {
		return function getDomRect () {
			const layout = getLayout(self || this, relative);
			if (typeof props === 'string') return layout[props];
			return props.reduce((rect, prop) => {
				rect[prop] = layout[prop];
				return rect;
			}, {});
		};
	}

	function requireElementStyles (source) {
		if (!elementStyles.has(source)) {
			elementStyles.set(source, {});
			if (source.ownerDocument) elementParents.set(source, source.ownerDocument.defaultView);
		}

		return elementStyles.get(source);
	}

	function getLayout (source, relative) {
		const compoundedStyles = [
			...cascadingStyles.getMatchingStyles(source),
			elementStyles.get(source),
		]
			.filter(Boolean)
			.reduce((compounded, current) => {
				return Object.assign(compounded, current);
			}, {});

		const compoundedLayout = Layout(compoundedStyles);
		if (!relative) return compoundedLayout;

		return getAncestors(source)
			.map(ancestor => elementStyles.get(ancestor))
			.filter(Boolean)
			.reduce((layout, ancestorStyles) => {
				layout.x -= ancestorStyles.scrollX || 0;
				layout.y -= ancestorStyles.scrollY || 0;
				return layout;
			}, compoundedLayout);
	}

	function getAncestors (element) {
		const ancestors = [];
		let parent = element;
		while ((parent = elementParents.get(parent))) {
			ancestors.push(parent);
		}
		return ancestors;
	}
};

function Styles (initialRuleSet = {}) {
	const ruleSheet = {};
	let rules = [];

	add(initialRuleSet);

	return {
		getMatchingStyles,
		add,
	};

	function add (...ruleSets) {
		Object.assign(ruleSheet, ...ruleSets);
		rules = [];

		for (const [ selectorList, styles ] of Object.entries(ruleSheet)) {
			for (const selector of selectorList.split(',')) {
				rules.push([ selector, styles ]);
			}
		}
	}

	function getMatchingStyles (element) {
		if (!element.nodeName) return [];
		return rules
			.filter(([ selector ]) => element.matches(selector))
			.map(([ selector, styles ]) => [ specificity.calculate(selector), styles ])
			.sort(([ selA ], [ selB ]) => specificity.compare(selA, selB))
			.map(([ , styles ]) => styles);
	}
}

function Layout (boundingBox = {}) {
	return Object.preventExtensions({
		width: boundingBox.width || 0,
		height: boundingBox.height || 0,
		x: boundingBox.x || 0,
		y: boundingBox.y || 0,
		get left () {
			return Math.min(this.x, this.x + this.width);
		},
		get right () {
			return Math.max(this.x + this.width, this.x);
		},
		get top () {
			return Math.min(this.y, this.y + this.height);
		},
		get bottom () {
			return Math.max(this.y + this.height, this.y);
		},
		scrollWidth: boundingBox.scrollWidth || 0,
		scrollHeight: boundingBox.scrollTop || 0,
		scrollX: boundingBox.scrollX || 0,
		scrollY: boundingBox.scrollY || 0,
	});
}
