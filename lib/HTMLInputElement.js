import { Event, InputEvent, PointerEvent } from "./Events.js";
import HTMLElement from "./HTMLElement.js";
import ValidityState from "./ValidityState.js";

const kValidity = Symbol.for("validity");
const kValidationMessage = Symbol.for("validation message");
const kFiles = Symbol.for("files");

export default class HTMLInputElement extends HTMLElement {
  constructor(...args) {
    super(...args);

    this[kValidationMessage] = "";
    this[kValidity] = new ValidityState(this);
    this[kFiles] = [];
  }
  get checked() {
    return this.$elm.prop("checked");
  }
  set checked(value) {
    const checked = this.$elm.prop("checked");
    switch (this.type) {
      case "checkbox":
        break;
      case "radio": {
        const name = this.name;
        const $form = this.$elm.closest("form");
        if ($form && $form.length) {
          $form.find(`input[type="radio"][name="${name}"]`).prop("checked", false);
        } else {
          this.ownerDocument.$(`input[type="radio"][name="${name}"]`).prop("checked", false);
        }
        break;
      }
      default:
        return value;
    }

    this.$elm.prop("checked", !!value);
    if (checked === !!value) this.dispatchEvent(new InputEvent("input"));

    return value;
  }
  get disabled() {
    return this.$elm.prop("disabled");
  }
  set disabled(value) {
    if (value === true) return this.setAttribute("disabled", "disabled");
    this.removeAttribute("disabled");
  }
  get readOnly() {
    return this.$elm.prop("readonly");
  }
  set readOnly(value) {
    if (value === true) return this.setAttribute("readonly", "readonly");
    this.removeAttribute("readonly");
  }
  get required() {
    return this.$elm.prop("required");
  }
  set required(value) {
    if (value === true) return this.setAttribute("required", "required");
    this.removeAttribute("required");
  }
  get multiple() {
    return this.$elm.prop("multiple");
  }
  set multiple(value) {
    if (value === true) return this.setAttribute("multiple", "");
    this.removeAttribute("multiple");
  }
  get validationMessage() {
    return this[kValidationMessage];
  }
  get validity() {
    return this[kValidity];
  }
  get value() {
    const value = this.getAttribute("value");
    if (value === null) return "";
    return value;
  }
  set value(val) {
    const oldVal = this.getAttribute("value");

    if (oldVal !== val) {
      this.setAttribute("value", val);
      switch (this.type) {
        case "checkbox":
        case "radio":
          break;
        case "text":
        case "email":
        case "tel":
        case "number":
        case "url":
          this.dispatchEvent(new InputEvent("input"));
          break;
        case "file":
          if (!val) this[kFiles].length = 0;
          this.dispatchEvent(new Event("input"));
          break;
        default:
          this.dispatchEvent(new Event("input"));
          break;
      }
    }

    return val;
  }
  get accept() {
    const value = this.getAttribute("accept");
    if (value === null) return "";
    return value;
  }
  set accept(value) {
    this.setAttribute("accept", value);
    return value;
  }
  get files() {
    return this[kFiles];
  }
  get willValidate() {
    if (this.readOnly) return false;
    if (this.disabled) return false;
    return this.type !== "hidden";
  }
  click() {
    if (this.disabled) return;
    const clickEvent = new PointerEvent("click", { bubbles: true });
    const type = this.type;

    let changed = false;
    if (type === "radio") {
      changed = !this.checked;
      this.checked = true;
    }

    if (type === "checkbox") {
      changed = true;
      this.checked = !this.checked;
    }

    this.dispatchEvent(clickEvent);

    if (clickEvent.defaultPrevented) return;

    if (changed) {
      this.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
  reportValidity() {
    return this.checkValidity();
  }
  checkValidity() {
    const validity = this[kValidity];
    if (!validity.valid) this.dispatchEvent(new Event("invalid", { bubbles: true }));
    return validity.valid;
  }
  setCustomValidity(...args) {
    if (!args.length) throw new TypeError(`Failed to execute 'setCustomValidity' on '${this.constructor.name}': 1 argument required, but only 0 present.`);
    this[kValidationMessage] = `${args[0]}`;
  }
  _uploadFile(file) {
    let changed = false;
    if (!this[kFiles].includes(file)) {
      if (this.multiple) {
        this[kFiles].push(file);
      } else {
        this[kFiles] = [file];
      }
      changed = true;
    }

    if (changed) {
      if (this[kFiles].length) {
        this.value = `C:\\fakepath\\${this[kFiles][0].name}`;
      } else {
        this.value = "";
      }
    }
  }
}
