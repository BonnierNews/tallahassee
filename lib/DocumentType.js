import Node from "./Node.js";

export default class DocumentType extends Node {
  get nodeType() {
    return 10;
  }
}
