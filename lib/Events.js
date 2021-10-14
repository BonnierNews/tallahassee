"use strict";

const cancelBubbleSymbol = Symbol.for("cancelBubble");
const defaultPreventedSymbol = Symbol.for("defaultPrevented");
const detailSymbol = Symbol.for("detail");

class Event {
  constructor(type = "", {bubbles} = {bubbles: false}) {
    this[defaultPreventedSymbol] = false;
    this[cancelBubbleSymbol] = false;
    this.type = type;
    this.bubbles = bubbles;
    this.path = [];
  }
  get defaultPrevented() {
    return this[defaultPreventedSymbol];
  }
  get cancelBubble() {
    return this[cancelBubbleSymbol];
  }
  preventDefault() {
    this[defaultPreventedSymbol] = true;
  }
  stopPropagation() {
    this[cancelBubbleSymbol] = true;
  }
  initCustomEvent(customType = "") {
    this.type = customType;
  }
}

class CustomEvent extends Event {
  constructor(type, customEventInit = {}) {
    super(type);
    this[detailSymbol] = customEventInit.detail || null;
  }
  get detail() {
    return this[detailSymbol];
  }
  initCustomEvent(customType = "", canBubble, cancelable, customDetail = null) {
    this.type = customType;
    this[detailSymbol] = customDetail;
  }
}

module.exports = {
  Event,
  CustomEvent
};

// function CustomEvent(type = "", customEventInit = {}) {
//   const customEvent = Event(type);
//   let detail = customEventInit.detail || null;

//   Object.defineProperty(customEvent, "detail", {
//     get() {
//       return detail;
//     }
//   });

//   customEvent.initCustomEvent = (customType = "", canBubble, cancelable, customDetail = null) => {
//     customEvent.type = customType;
//     detail = customDetail;
//   };

//   Object.setPrototypeOf(customEvent, CustomEvent.prototype);

//   return customEvent;
// }
