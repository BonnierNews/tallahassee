"use strict";

module.exports = function CustomEvent(name, data) {
  let defaultPrevented;
  let cancelBubble;
  const event = {
    type: name,
    preventDefault,
    stopPropagation,
    get defaultPrevented() {
      return defaultPrevented;
    },
    get cancelBubble() {
      return cancelBubble;
    }
  };

  if (data) {
    event.detail = data.detail;
  }

  event.initCustomEvent = (type, canBubble, cancelable, detail) => {
    event.type = type;
    event.detail = detail.detail;
  };

  return event;

  function preventDefault() {
    defaultPrevented = true;
  }

  function stopPropagation() {
    cancelBubble = true;
  }
};
