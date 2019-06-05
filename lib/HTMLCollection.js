"use strict";

const MutationObserver = require("./MutationObserver");

module.exports = {
  HTMLCollectionFactory,
  HTMLCollection,
};

function HTMLCollectionFactory(parent, selector, options = { attributes: true }) {
  const liveList = [];
  const {$, _getElement} = parent.ownerDocument;

  updateList();

  const observer = new MutationObserver(updateList);
  observer.observe(parent, {...options, childList: true});

  return HTMLCollection(liveList);

  function updateList() {
    const list = parent.$elm.find(selector).map((_, elm) => _getElement($(elm))).toArray();
    liveList.length = 0;
    liveList.splice(0, -1, ...list);
  }
}

function HTMLCollection(liveList) {
  const ListHandler = {
    getPrototypeOf() {
      return HTMLCollection.prototype;
    },
    get(target, name) {
      if (name === "length") return liveList.length;
      if (!/^[-]?\d+$/.test(name)) return undefined;
      return liveList[name];
    }
  };

  return new Proxy({}, ListHandler);
}
