"use strict";

module.exports = {
  Event,
  CustomEvent
};

function Event(type = "", {bubbles} = {bubbles: false}) {
  let defaultPrevented;
  let cancelBubble;

  const event = {
    type,
    bubbles,
    preventDefault,
    stopPropagation,
    get defaultPrevented() {
      return defaultPrevented;
    },
    get cancelBubble() {
      return cancelBubble;
    },
    path: []
  };

  event.initCustomEvent = (customType = "") => {
    event.type = customType;
  };

  Object.setPrototypeOf(event, Event.prototype);

  return event;

  function preventDefault() {
    defaultPrevented = true;
  }

  function stopPropagation() {
    cancelBubble = true;
  }
}

function CustomEvent(type = "", customEventInit = {}) {
  const customEvent = Event(type);
  let detail = customEventInit.detail || null;

  Object.defineProperty(customEvent, "detail", {
    get() {
      return detail;
    }
  });

  customEvent.initCustomEvent = (customType = "", canBubble, cancelable, customDetail = null) => {
    customEvent.type = customType;
    detail = customDetail;
  };

  Object.setPrototypeOf(customEvent, CustomEvent.prototype);

  return customEvent;
}
