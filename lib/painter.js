export default function Painter () {
  const layouts = new Map();

  return {
    paint,
    scrollWindowTo,
    scrollWindowBy,
    scrollWindowToElement,
    getElementDomRect: GetElementDomRect(),
    getElementDomRectWidth: GetElementDomRect("width"),
    getElementDomRectHeight: GetElementDomRect("height"),
    getElementDomRectX: GetElementDomRect("x"),
    getElementDomRectY: GetElementDomRect("y"),
  };

  function paint (element, domRectChanges) {
    const layout = getLayout(element);
    for (const [prop, value] of Object.entries(domRectChanges)) {
      layout[prop] = value;
    }
  }

  function scrollWindowTo (x, y) {
    const xDelta = x - this.pageXOffset;
    const yDelta = y - this.pageYOffset;
    scrollWindowBy.call(this, xDelta, yDelta);
  }

  function scrollWindowBy (xDelta, yDelta) {
    for (const [, layout] of layouts) {
      layout.x = layout.x - xDelta;
      layout.y = layout.y - yDelta;
    }

    this.pageXOffset += xDelta;
    this.pageYOffset += yDelta;
    this.dispatchEvent(new this.Event("scroll"));
  }

  function scrollWindowToElement () {
    const { x, y } = getLayout(this);
    scrollWindowBy.call(this.ownerDocument.defaultView, x, y);
  }

  function GetElementDomRect (prop) {
    return function getElementDomRect () {
      const layout = getLayout(this);
      if (!prop) return layout;
      return layout[prop];
    }
  }

  function getLayout (source) {
    if (!layouts.has(source)) {
      layouts.set(source, ElementLayout(source));
    }

    return layouts.get(source);
  }
}

function ElementLayout () {
  return Object.preventExtensions({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
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
  });
}
