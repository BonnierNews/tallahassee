"use strict";

module.exports = matchMedia;

let window;
function matchMedia(mediaQuery) {
  if (mediaQuery === undefined) throw new TypeError("Failed to execute 'matchMedia' on 'Window': 1 argument required, but only 0 present.");

  window = this;

  return evaluate(mediaQuery);
}

function evaluate(query) {
  const mediaTypes = /^(only\s|any\s|not\s)?(all|screen|print)/.exec(query);
  let match = false;

  if (mediaTypes) {
    match = evaluateMediaTypes(mediaTypes);
  }

  const mediaConditions = /\((.*?)\)/.exec(query);
  if (mediaConditions) {
    match = evaluateMediaConditions(mediaConditions);
  }

  return {
    media: query,
    matches: match
  };

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
