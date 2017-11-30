"use strict";

module.exports = ElementScroller;

function ElementScroller(browser, stackedElementsFn) {
  const innerHeight = browser.window.innerHeight;

  stackedElementsFn = stackedElementsFn || getArticleElements;

  return {
    scrollToTopOfElement,
    scrollToBottomOfElement
  };

  function scrollToTopOfElement(element, offset = 0) {
    const elements = stackedElementsFn();
    const index = elements.indexOf(element);

    for (let i = 0; i < elements.length; i++) {
      const elm = elements[i];
      if (i < index) {
        elm.setBoundingClientRect(-99999);
      } else if (i === index) {
        elm.setBoundingClientRect(0 + offset);
      } else {
        elm.setBoundingClientRect(1000);
      }
    }

    browser.window.scroll();
  }

  function scrollToBottomOfElement(element, offset = 0) {
    const elements = stackedElementsFn();
    const index = elements.indexOf(element);

    for (let i = 0; i < elements.length; i++) {
      const elm = elements[i];
      if (i < index) {
        elm.setBoundingClientRect(-99999);
      } else if (i === index) {
        const {height} = elm.getBoundingClientRect();
        elm.setBoundingClientRect(innerHeight - height + offset);
      } else {
        elm.setBoundingClientRect(innerHeight + 1000);
      }
    }

    browser.window.scroll();
  }

  function getArticleElements() {
    return browser.document.getElementsByClassName("article");
  }
}
