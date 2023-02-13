const prefixNamePattern = /^(-?)(moz|ms|webkit)([A-Z]|\1)/;

class CSSStyleDeclarationHandler {
  constructor(element) {
    this.$elm = element.$elm;
    this.styles = {};
  }
  ownKeys() {
    return Object.keys(this.getStyleAsObject()).map(getPropName);
  }
  getOwnPropertyDescriptor(target, prop) {
    const styles = this.getStyleAsObject();
    const name = getStyleName(prop);
    if (!(name in styles)) return;

    return {
      value: styles[name].value,
      writable: true,
      enumerable: true,
      configurable: true,
    };
  }
  has(target, prop) {
    if (typeof prop === "symbol") return !!target[prop];
    if (prop in target) return !!target[prop];

    const styles = this.getStyleAsObject();
    const name = getStyleName(prop);
    return name in styles;
  }
  get(target, prop) {
    if (typeof prop === "symbol") return target[prop];
    if (prop in target) return target[prop];

    const styles = this.getStyleAsObject();
    const name = getStyleName(prop);
    return styles[name] || "";
  }
  set(target, prop, value) {
    if (typeof prop === "symbol") return target[prop] = value;
    if (prop in target) return target[prop] = value;

    if (value === "" || value === null) value = "";
    this.saveStyle({[getStyleName(prop)]: value});
    return true;
  }
  deleteProperty(target, prop) {
    if (typeof prop === "symbol") return delete target[prop];
    if (prop in target) return delete target[prop];

    this.saveStyle({[getStyleName(prop)]: undefined});
    return true;
  }
  saveStyle(newStyles) {
    const styles = {
      ...this.getStyleAsObject(),
      ...newStyles,
    };

    if (!Object.keys(styles).length) return this.$elm.removeAttr("style");
    const styleValue = Object.entries(styles).reduce((result, [prop, value]) => {
      if (value === undefined || value === "") return result;

      const styleName = getStyleName(prop);
      result += `${styleName}: ${value};`;
      return result;
    }, "");

    if (!styleValue) return this.$elm.removeAttr("style");

    this.$elm.attr("style", styleValue);
  }
  getStyleAsObject() {
    const styleAttr = this.$elm.attr("style");
    const style = {};
    if (!styleAttr) return style;
    styleAttr.replace(/\s*(.+?):\s*(.*?)(;|$)/g, (_, name, value) => {
      style[name] = value;
    });
    return style;
  }
}

export default class CSSStyleDeclaration {
  constructor(element) {
    return new Proxy(this, new CSSStyleDeclarationHandler(element));
  }
  setProperty(name, value) {
    this[name] = value;
  }
  removeProperty(name) {
    delete this[name];
  }
}

function getStyleName(prop) {
  const kcName = prop.replace(prefixNamePattern, (__, isPrefix, prefix, suffix) => {
    return `-${prefix}${suffix}`;
  });

  return kcName.replace(/([A-Z])([a-z]+)/g, (__, firstLetter, rest) => `-${firstLetter.toLowerCase()}${rest}`);
}

function getPropName(name) {
  const ccName = name.replace(prefixNamePattern, (__, isPrefix, prefix, suffix) => {
    return prefix + suffix;
  });
  return ccName.replace(/-(\w)(\w+)/g, (__, firstLetter, rest) => `${firstLetter.toUpperCase()}${rest}`);
}
