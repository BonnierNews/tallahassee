import NodeFormData from "form-data";

const kForm = Symbol.for("form");

export default class FormData extends NodeFormData {
  constructor(form) {
    super();
    if (form && form.tagName !== "FORM") throw new TypeError("Failed to construct 'FormData': parameter 1 is not of type 'HTMLFormElement'");
    this[kForm] = form;
  }
  entries() {
    const result = [];
    const form = this[kForm];
    if (form) {
      for (const elm of this[kForm].elements) {
        if (!elm.name || elm.disabled) continue;

        switch (elm.type) {
          case "checkbox":
          case "radio":
            if (!elm.checked) continue;
            break;
          case "submit":
            continue;
          case "file":
            result.push([ elm.name, elm.files[0] ]);
            continue;
          case "select-multiple": {
            for (const option of elm.selectedOptions) {
              result.push([ elm.name, option.value ]);
            }
            continue;
          }
        }

        result.push([ elm.name, elm.value ]);
      }
    }
    return result[Symbol.iterator]();
  }
  get(name) {
    const hit = [ ...this.entries() ].find(([ elName ]) => elName === name);
    return hit[1];
  }
  toString() {
    return `[object ${this.prototype.name}]`;
  }
  [Symbol.iterator]() {
    return this.entries();
  }
}
