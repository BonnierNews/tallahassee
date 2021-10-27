"use strict";

const windowSymbol = Symbol.for("window");
const historyStatesSymbol = Symbol.for("historyStates");
const currentHistoryStateSymbol = Symbol.for("currentHistoryState");

module.exports = class History {
  constructor(window, location) {
    this[windowSymbol] = window;
    this[historyStatesSymbol] = [new URL(location.toString())];
    this[currentHistoryStateSymbol] = 0;
  }
  go(delta) {
    if (delta === 0) return;
    // It should not be possible to go back to a state before the first one
    const current = this[currentHistoryStateSymbol];
    if (delta < 0 && Math.abs(delta) > current) return;
    // It should not be possible to go to a state that is beyond the stored states
    const states = this[historyStatesSymbol];
    if (delta > 0 && delta >= states.length - this[currentHistoryStateSymbol]) return;
    const newState = states[current + delta];
    const location = this[windowSymbol].location;

    location.pathname = newState.pathname;
    location.search = newState.search;
    location.hash = newState.hash;

    this[currentHistoryStateSymbol] += delta;
  }
  back() {
    this.go(-1);
  }
  forward() {
    this.go(1);
  }
  pushState(ign1, ign2, relativeUrl) {
    const location = this[windowSymbol].location;
    const newUrl = new URL(relativeUrl, location.origin);

    location.pathname = newUrl.pathname;
    location.search = newUrl.search;
    location.hash = newUrl.hash;

    const current = ++this[currentHistoryStateSymbol];
    this[historyStatesSymbol] = this[historyStatesSymbol].slice(0, current);
    this[historyStatesSymbol].push(newUrl);
  }
  replaceState(ign1, ign2, relativeUrl) {
    const location = this[windowSymbol].location;
    const newUrl = new URL(relativeUrl, location.origin);

    location.pathname = newUrl.pathname;
    location.search = newUrl.search;
    location.hash = newUrl.hash;

    this[historyStatesSymbol][this[currentHistoryStateSymbol]] = newUrl;
  }
};
