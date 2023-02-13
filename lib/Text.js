import Node from "./Node.js";

export default class Text extends Node {
  get textContent() {
    return this.$elm[0].data;
  }
  set textContent(value) {
    return this.$elm[0].data = value;
  }
  get nodeValue() {
    return this.textContent;
  }
  set nodeValue(value) {
    return this.$elm[0].data = value;
  }
}
