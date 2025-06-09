"use strict";

const cancelBubbleSymbol = Symbol.for("cancelBubble");
const defaultPreventedSymbol = Symbol.for("defaultPrevented");
const detailSymbol = Symbol.for("detail");
const kSubmitter = Symbol.for("submitter");
const stateSymbol = Symbol.for("state");

class Event {
  constructor(type = "", options = {}) {
    this[defaultPreventedSymbol] = false;
    this[cancelBubbleSymbol] = false;
    this.type = type;
    this.bubbles = options.bubbles ?? false;
    this.cancelable = options.cancelable ?? false;
    this.path = [];
  }
  get defaultPrevented() {
    return this[defaultPreventedSymbol];
  }
  get cancelBubble() {
    return this[cancelBubbleSymbol];
  }
  get currentTarget() {
    return this.path[this.path.length - 1];
  }
  get target() {
    return this.path[0];
  }
  preventDefault() {
    if (!this.cancelable) return;
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
  constructor(type, options) {
    super(type, options);
    this[detailSymbol] = options?.detail ?? null;
  }
  get detail() {
    return this[detailSymbol];
  }
  initCustomEvent(customType = "", canBubble, cancelable, customDetail) {
    Object.assign(
      this,
      new CustomEvent(customType, {
        bubbles: canBubble,
        cancelable,
        detail: customDetail,
      })
    );
  }
}

class SubmitEvent extends Event {
  constructor(type, options = { bubbles: true }) {
    super(type, options);
    this[kSubmitter] = undefined;
  }
  get submitter() {
    return this[kSubmitter];
  }
}

class PopStateEvent extends Event {
  constructor(options) {
    super("popstate", { bubbles: false });
    this[stateSymbol] = options.state;
  }

  get state() {
    return this[stateSymbol];
  }
}

class UIEvent extends Event {}

class FocusEvent extends UIEvent {
  constructor(type, options = {}) {
    super(type, { bubbles: true });

    this.relatedTarget = options.relatedTarget || null;
  }
}

class InputEvent extends UIEvent {
  constructor(type) {
    super(type, { bubbles: true });
  }
}

class PointerEvent extends UIEvent {}

class KeyboardEvent extends UIEvent {
  constructor(type, options = {}) {
    super(type, { bubbles: true });

    this.key = options.key;
  }
}

const symbols = { submitter: kSubmitter };

module.exports = {
  Event,
  CustomEvent,
  InputEvent,
  FocusEvent,
  PointerEvent,
  SubmitEvent,
  PopStateEvent,
  KeyboardEvent,
  symbols,
};
