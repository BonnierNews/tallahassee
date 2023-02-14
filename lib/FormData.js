import { FormData as NodeFetchFormData } from "node-fetch";

export default class FormData extends NodeFetchFormData {
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
          case "file":
            this.append(elm.name, elm.files[0], elm.files[0].name);
            continue;
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
}
