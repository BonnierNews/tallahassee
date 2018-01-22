"use strict";

module.exports = ElementScroller;

function ElementScroller(browser, stackedElementsFn) {
  stackedElementsFn = stackedElementsFn || getArticleElements;

  return {
    scrollToTopOfElement,
    scrollToBottomOfElement
  };

  function scrollToTopOfElement(element, offset = 0) {
    const elements = stackedElementsFn();

    if (!element) return;

    const {top: previousTop} = element.getBoundingClientRect();
    const diff = offset - previousTop;

    for (let i = 0; i < elements.length; i++) {
      const elm = elements[i];
      const {top} = elm.getBoundingClientRect();
      elm._setBoundingClientRect(top + diff);
    }

    browser.window.scroll();
  }

  function scrollToBottomOfElement(element, offset = 0) {
    const {height} = element.getBoundingClientRect();
    const offsetFromBottom = browser.window.innerHeight - height;
    return scrollToTopOfElement(element, offsetFromBottom + offset);
  }

  function getArticleElements() {
    return browser.document.body.getElementsByTagName("article");
  }
}
