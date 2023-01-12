"use strict";

const kWindow = Symbol.for("window");
const kMedia = Symbol.for("media");
const kMatches = Symbol.for("matches");
const kOverride = Symbol.for("match media override");

module.exports = function (EventTarget) {
  return class MediaQueryList extends EventTarget {
    constructor(window, mediaQuery, overrideMatchMedia) {
      if (mediaQuery === undefined) throw new TypeError("Failed to execute 'matchMedia' on 'Window': 1 argument required, but only 0 present.");
      super();
      this[kWindow] = window;
      this[kMedia] = mediaQuery;
      this[kOverride] = overrideMatchMedia;
      this[kMatches] = this._evaluate();

      window.addEventListener("resize", this._reEvaluate.bind(this));
    }
    get media() {
      return this[kMedia];
    }
    get matches() {
      return this[kMatches];
    }
    _evaluate() {
      const mediaQuery = this.media;
      if (this[kOverride] instanceof RegExp && this[kOverride].test(mediaQuery)) {
        return true;
      }

      const mediaTypes = /^(only\s|any\s|not\s)?(all|screen|print)/.exec(mediaQuery);
      let match = false;

      if (mediaTypes) {
        match = this._evaluateMediaTypes(mediaTypes);
      }

      const mediaConditions = /\((.*?)\)/.exec(mediaQuery);
      if (mediaConditions) {
        match = this._evaluateMediaConditions(mediaConditions);
      }

      return match;
    }
    _evaluateMediaConditions(conditions) {
      const window = this[kWindow];
      for (let i = 1; i < conditions.length; i++) {
        const condition = conditions[i];
        const [prop, value] = condition.split(":");

        if (prop.startsWith("min")) {
          return window.innerWidth >= parseInt(value);
        } else if (prop.startsWith("max")) {
          return window.innerWidth <= parseInt(value);
        }
      }
    }
    _evaluateMediaTypes(types) {
      return types[0] === (this[kWindow].styleMedia?.type || "screen");
    }
    _reEvaluate() {
      const newMatches = this._evaluate();
      if (this[kMatches] === newMatches) return;

      this[kMatches] = newMatches;
      const mediaQueryListEvent = new this[kWindow].Event("change");
      mediaQueryListEvent.matches = newMatches;
      this.dispatchEvent(mediaQueryListEvent);
    }
  };
};
