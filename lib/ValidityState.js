"use strict";

const kParent = Symbol.for("parent");
const emailPattern = /^([^@\s])+@([^@\s])+$/;

class ValidateInput {
  constructor(element) {
    this.element = element;
    this.type = element.type || "text";
    this.value = element.value;
    this.attributes = element.$elm[0]?.attribs || {};
  }
  get min() {
    if (!("min" in this.attributes)) return NaN;
    return Number(this.attributes.min);
  }
  get max() {
    if (!("max" in this.attributes)) return NaN;
    return Number(this.attributes.max);
  }
  get step() {
    if (!("step" in this.attributes)) return NaN;
    return Number(this.attributes.step);
  }
  get minLength() {
    if (!("minlength" in this.attributes)) return NaN;
    return Number(this.attributes.minlength);
  }
  get maxLength() {
    if (!("maxlength" in this.attributes)) return NaN;
    return Number(this.attributes.maxlength);
  }
  get pattern() {
    if (!("pattern" in this.attributes)) return null;
    return new RegExp(`^(?:${this.attributes.pattern})$`);
  }
  get required() {
    return this.element.required;
  }
  ineligble() {
    if (this.element.disabled) return true;
    if (this.element.type === "hidden") return true;
    return this.value === "";
  }
}

class CustomError extends ValidateInput {
  validate() {
    if (this.element.disabled) return false;
    if (this.element.type === "hidden") return false;
    return !!this.element.validationMessage?.length;
  }
}

class PatternMismatch extends ValidateInput {
  validate() {
    const pattern = this.pattern;
    if (!pattern) return false;
    if (this.ineligble()) return false;
    return !pattern.test(this.value);
  }
}

class TooLong extends ValidateInput {
  validate() {
    if (this.ineligble()) return false;
    const compare = this.maxLength;
    if (isNaN(compare)) return false;
    return this.value.length > compare;
  }
}

class TooShort extends ValidateInput {
  validate() {
    if (this.ineligble()) return false;
    const compare = this.minLength;
    if (isNaN(compare)) return false;
    return this.value.length < compare;
  }
}

class TypeMismatch extends ValidateInput {
  validate() {
    if (this.ineligble()) return false;
    switch (this.type) {
      case "email":
        return !emailPattern.test(this.value);
    }
    return false;
  }
}

class ValueMissing extends ValidateInput {
  validate() {
    if (this.element.disabled) return false;
    if (this.element.type === "hidden") return false;
    return this.required && this.value === "";
  }
}

class RangeOverflow extends ValidateInput {
  validate() {
    if (this.ineligble()) return false;
    const compare = this.max;
    if (isNaN(compare)) return false;

    let value;
    switch (this.type) {
      case "number":
        value = Number(this.value);
        break;
      default:
        return false;
    }

    if (isNaN(value)) return false;
    return value > compare;
  }
}

class RangeUnderflow extends ValidateInput {
  validate() {
    if (this.ineligble()) return false;
    const compare = this.min;
    if (isNaN(compare)) return false;

    let value;
    switch (this.type) {
      case "number":
        value = Number(this.value);
        break;
      default:
        return false;
    }

    if (isNaN(value)) return false;
    return value < compare;
  }
}


class StepMismatch extends ValidateInput {
  validate() {
    if (this.ineligble()) return false;
    const compare = this.step;
    if (isNaN(compare)) return false;

    let value;
    switch (this.type) {
      case "number":
        value = Number(this.value);
        break;
      default:
        return false;
    }

    if (isNaN(value)) return false;
    return !!(value % compare);
  }
}

module.exports = class ValidityState {
  constructor(element) {
    this[kParent] = element;
  }
  get badInput() {
    return false;
  }
  get customError() {
    return new CustomError(this[kParent]).validate();
  }
  get patternMismatch() {
    return new PatternMismatch(this[kParent]).validate();
  }
  get rangeOverflow() {
    return new RangeOverflow(this[kParent]).validate();
  }
  get rangeUnderflow() {
    return new RangeUnderflow(this[kParent]).validate();
  }
  get stepMismatch() {
    return new StepMismatch(this[kParent]).validate();
  }
  get tooLong() {
    return new TooLong(this[kParent]).validate();
  }
  get tooShort() {
    return new TooShort(this[kParent]).validate();
  }
  get typeMismatch() {
    return new TypeMismatch(this[kParent]).validate();
  }
  get valueMissing() {
    return new ValueMissing(this[kParent]).validate();
  }
  get valid() {
    return ![
      "valueMissing",
      "typeMismatch",
      "customError",
      "patternMismatch",
      "tooLong",
      "tooShort",
      "stepMismatch",
      "rangeUnderflow",
      "rangeOverflow",
      "badInput",
    ].some((prop) => this[prop]);
  }
};

