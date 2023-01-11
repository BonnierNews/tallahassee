"use strict";

module.exports = function domOverrides(window) {
  const defaultRect = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: 0,
    height: 0,
  };
  Object.defineProperties(window.Element.prototype, {
    _setBoundingClientRect: {
      value(axes) {
        this._rect = { ...defaultRect, ...this._rect};
        if (!("bottom" in axes)) {
          axes.bottom = axes.top;
        }

        for (const axis in axes) {
          if (axes.hasOwnProperty(axis)) {
            this._rect[axis] = axes[axis];
          }
        }

        this._rect.height = this._rect.bottom - this._rect.top;
        this._rect.width = this._rect.right - this._rect.left;
      }
    },
    getBoundingClientRect: {
      value() {
        return { ...defaultRect, ...this._rect};
      }
    }
  });

  Object.defineProperties(window, {
    _pageOffset: {
      enumerable: false,
      value: {
        X: 0,
        Y: 0
      }
    },
    pageXOffset: {
      get() {
        return this._pageOffset.X;
      }
    },
    pageYOffset: {
      get() {
        return this._pageOffset.Y;
      }
    },
    scroll: {
      value(xCoord, yCoord) {
        const pageOffset = this._pageOffset;
        if (xCoord && typeof xCoord === "object") {
          const {top, left} = xCoord;
          pageOffset.Y = !isNaN(top) ? top : pageOffset.Y;
          pageOffset.X = !isNaN(left) ? left : pageOffset.X;
        } else {
          if (xCoord !== undefined) pageOffset.X = xCoord;
          if (yCoord !== undefined) pageOffset.Y = yCoord;
        }
        window.dispatchEvent(new window.Event("scroll"));
      }
    }
  });
};
