import NodeList from "./NodeList.js";

export default class HTMLCollection extends NodeList {
  constructor(parentElement, selector, options = { attributes: true }) {
    super(parentElement, selector, { ...options });

    Object.defineProperties(this, {
      item: { enumerable: true },
      namedItem: { enumerable: true },
    });
  }
}
