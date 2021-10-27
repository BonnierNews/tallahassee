"use strict";

const {EventEmitter} = require("events");

module.exports = function MediaQueryList(mediaQuery) {
  if (mediaQuery === undefined) throw new TypeError("Failed to execute 'matchMedia' on 'Window': 1 argument required, but only 0 present.");

  const window = this;

  window.styleMedia = window.styleMedia || { type: "screen" };

  let matches = evaluate();
  const emitter = new EventEmitter();

  window.addEventListener("resize", reEvaluate);

  return {
    media: mediaQuery,
    get matches() {
      return matches;
    },
    addListener(callback) {
      emitter.on("change", callback);
    },
    removeListener(callback) {
      emitter.off("change", callback);
    }
  };

  function reEvaluate() {
    const newMatches = evaluate();
    if (matches === newMatches) return;

    matches = newMatches;
    const mediaQueryListEvent = new window.Event("change");
    mediaQueryListEvent.matches = matches;
    emitter.emit("change", mediaQueryListEvent);
  }

  function evaluate() {
    const mediaTypes = /^(only\s|any\s|not\s)?(all|screen|print)/.exec(mediaQuery);
    let match = false;

    if (mediaTypes) {
      match = evaluateMediaTypes(mediaTypes);
    }

    const mediaConditions = /\((.*?)\)/.exec(mediaQuery);
    if (mediaConditions) {
      match = evaluateMediaConditions(mediaConditions);
    }

    return match;

    function evaluateMediaConditions(conditions) {
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

    function evaluateMediaTypes(types) {
      return types[0] === window.styleMedia.type;
    }
  }
};
