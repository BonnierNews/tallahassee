"use strict";

const { FormData } = require("node-fetch-commonjs");

module.exports = class DOMFormData extends FormData {
  constructor(form) {
    super();
    if (form && form.tagName !== "FORM") throw new TypeError("Failed to construct 'FormData': parameter 1 is not of type 'HTMLFormElement'");

    this.result = [];
    if (form) {
      for (const elm of form.elements) {
        if (!elm.name || elm.disabled) continue;

        switch (elm.type) {
          case "checkbox":
          case "radio":
            if (!elm.checked) continue;
            break;
          case "submit":
            continue;
          case "file": {
            for (const file of elm.files) {
              this.append(elm.name, file, file?.name || "blob");
            }
            continue;
          }
          case "select-multiple": {
            for (const option of elm.selectedOptions) {
              this.append(elm.name, option.value);
            }
            continue;
          }
        }

        this.append(elm.name, elm.value);
      }
    }
  }
};
