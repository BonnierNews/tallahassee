import DOMException from "domexception";

const kWindow = Symbol.for("window");
const kElementFactory = Symbol.for("element factory");

export default class CustomElementRegistry {
  constructor(window) {
    this[kWindow] = window;
  }
  get(name) {
    return this[kWindow].document[kElementFactory].get(name);
  }
  define(name, constructor) {
    if (this.get(name)) throw new DOMException(`Failed to execute 'define' on 'CustomElementRegistry': the name "${name}" has already been used with this registry`);
    const document = this[kWindow].document;
    document[kElementFactory].define(name, constructor);
    document.getElementsByTagName(name);
  }
}
