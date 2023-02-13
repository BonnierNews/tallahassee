import { PopStateEvent } from "./Events.js";

const windowSymbol = Symbol.for("window");
const historyStatesSymbol = Symbol.for("historyStates");
const currentHistoryStateSymbol = Symbol.for("currentHistoryState");

export default class History {
  constructor(window, location) {
    this[windowSymbol] = window;
    this[historyStatesSymbol] = [ { state: null, url: new URL(location.toString()) } ];
    this[currentHistoryStateSymbol] = 0;
  }
  get state() {
    const { url } = this[historyStatesSymbol][this[currentHistoryStateSymbol]];
    return {
      as: url.pathname,
      idx: this[currentHistoryStateSymbol],
    };
  }
  go(delta) {
    if (delta === 0) return;
    // It should not be possible to go back to a state before the first one
    const current = this[currentHistoryStateSymbol];
    if (delta < 0 && Math.abs(delta) > current) return;
    // It should not be possible to go to a state that is beyond the stored states
    const states = this[historyStatesSymbol];
    if (delta > 0 && delta >= states.length - this[currentHistoryStateSymbol]) return;
    const oldState = states[current];
    const newState = states[current + delta];
    const location = this[windowSymbol].location;

    location.pathname = newState.url.pathname;
    location.search = newState.url.search;
    location.hash = newState.url.hash;

    this[currentHistoryStateSymbol] += delta;

    if (JSON.stringify(oldState.state) !== JSON.stringify(newState.state)) {
      this[windowSymbol].dispatchEvent(new PopStateEvent({ state: newState.state }));
    }
  }
  back() {
    this.go(-1);
  }
  forward() {
    this.go(1);
  }
  pushState(state, _ignore, relativeUrl) {
    const location = this[windowSymbol].location;
    const newUrl = new URL(relativeUrl, location.origin);

    location.pathname = newUrl.pathname;
    location.search = newUrl.search;
    location.hash = newUrl.hash;

    const current = ++this[currentHistoryStateSymbol];
    this[historyStatesSymbol] = this[historyStatesSymbol].slice(0, current);
    this[historyStatesSymbol].push({ state, url: newUrl });
  }
  replaceState(state, _ignore, relativeUrl) {
    const location = this[windowSymbol].location;
    const newUrl = new URL(relativeUrl, location.origin);

    location.pathname = newUrl.pathname;
    location.search = newUrl.search;
    location.hash = newUrl.hash;

    this[historyStatesSymbol][this[currentHistoryStateSymbol]] = { state, url: newUrl };
  }
}
