import { createRequire } from 'module';
import { promises as fs } from "fs";
import jsdom from "jsdom";
import path from "path";
import vm from "vm";

const require = createRequire(import.meta.url);

export default class ResourceLoader extends jsdom.ResourceLoader {
  constructor (options, ...args) {
    super(...args);
    this.options = options;
  }

  resolveTag (tag) {
    const attrs = this.options.resolveTag &&
      this.options.resolveTag(tag);

    switch (typeof attrs) {
      case "string":
        return {src: attrs, type: "module"};
      case "object":
        if (!attrs) return attrs;
        return {
          src: attrs.src || tag.src,
          type: attrs.type || tag.type,
        };
      default:
        return {src: tag.src, type: tag.type};
    }
  }

  async runScripts (dom, { noModule = false } = {}) {
    const domContext = dom.getInternalVMContext();
    const fetchPolyfill = await fs.readFile(require.resolve("whatwg-fetch"), "utf8");
    vm.runInContext(fetchPolyfill, domContext);

    for (const element of dom.window.document.getElementsByTagName("script")) {
      let attrs = this.resolveTag(element);
      if (attrs === null) continue;
      if ((attrs.type === "module") && noModule) continue;

      const src = attrs.src && new URL(attrs.src, dom.window.location);
      const code = src ?
        await this.fetch(src.href, {element, cookieJar: dom.cookieJar}) :
        element.text;
      if (!code) continue;

      const entryModule = await Module(code, domContext, src.pathname);
      await entryModule.evaluate();
    }
  }
}

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
  return Module(fs.readFile(childPath), referencingModule.context, childPath)
}
