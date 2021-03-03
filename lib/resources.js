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
    const url = this.options.resolveTag &&
      this.options.resolveTag(tag);
    if (typeof url !== "undefined") return url;
    return tag.src;
  }

  // async resolveIdentifier (identifier) {
  //   const file = this.resolvers.identifier &&
  //     this.resolvers.identifier(identifier);
  //   if (typeof file !== "undefined") return file;
  //   return fs.readFile(identifier)
  // }

  async run (dom, cookieJar) {
    const domContext = dom.getInternalVMContext();
    const fetchPolyfill = await fs.readFile(require.resolve("whatwg-fetch"), "utf8");
    vm.runInContext(fetchPolyfill, domContext);

    for (const element of dom.window.document.getElementsByTagName("script")) {
      let sourceUrl = this.resolveTag(element);
      if (sourceUrl === null) continue;

      sourceUrl = sourceUrl && new URL(sourceUrl, dom.window.location);
      const code = sourceUrl ?
        await this.fetch(sourceUrl.toString(), {element, cookieJar}) :
        element.text;
      if (code === null) continue;

      const entryModule = await Module(code, domContext, sourceUrl.pathname);
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
