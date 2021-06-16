"use strict";

const { promises: fs } = require("fs");
const jsdom = require("jsdom");
const path = require("path");
const vm = require("vm");

module.exports = class ResourceLoader extends jsdom.ResourceLoader {
  constructor (options = {}, ...args) {
    super(...args);
    this.options = options;
  }

  // fetch (url, options) {
  //   const resourceURL = new URL(url);
  //   const referrerURL = new URL(options.referrer);
  //   if (this.options.agent && resourceURL.origin === referrerURL.origin) {
  //     this.options.agent
  //       .get(resourceURL.pathname)
  //       .end((response) => {
  //
  //       });
  //   }
  //
  //   return super.fetch(url, options);
  // }

  resolveTag (tag) {
    const attrs = this.options.resolveTag &&
      this.options.resolveTag(tag);

    switch (typeof attrs) {
      case "string":
        return { src: attrs, type: "module" };
      case "object":
        if (!attrs) return attrs;
        return {
          src: attrs.src || tag.src,
          type: attrs.type || tag.type,
        };
      default:
        return { src: tag.src, type: tag.type };
    }
  }

  async runScripts (dom, { noModule = false } = {}) {
    const domContext = dom.getInternalVMContext();
    const fetchPolyfill = await fs.readFile(require.resolve("whatwg-fetch"), "utf8");
    vm.runInContext(fetchPolyfill, domContext);

    for (const element of dom.window.document.getElementsByTagName("script")) {
      const attrs = this.resolveTag(element);
      if (attrs === null) continue;
      if (![ "module", "text/javascript", "" ].includes(attrs.type)) continue;
      if ((attrs.type === "module") && noModule) continue;

      const src = attrs.src && new URL(attrs.src, dom.window.location);
      const code = src ?
        await this.fetch(src.href, {
          element,
          cookieJar: dom.cookieJar,
          referrer: dom.window.location,
        }) :
        element.text;
      if (!code) continue;

      const entryModule = await Module(code, domContext, src.pathname);
      await entryModule.evaluate();
    }
  }
};

async function Module (pendingCode, context, identifier) {
  const code = await pendingCode;
  const mod = new vm.SourceTextModule(code.toString(), {
    context,
    identifier,
    importModuleDynamically: link,
  });
  await mod.link(link);
  return mod;
}

async function link (specifier, referencingModule) {
  const childPath = path.resolve(path.dirname(referencingModule.identifier), specifier);
  // if (!childPath.endsWith(".mjs"))
  //   childPath = childPath + ".js";
  return Module(fs.readFile(childPath), referencingModule.context, childPath);
}
