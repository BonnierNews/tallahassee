import { promises as fs } from "fs";
import jsdom from "jsdom";
import Painter from "./painter.js";
import path from "path";
import supertest from "supertest";
import vm from "vm";

export default function Browser(agentOrApp, cookieJar) {
  cookieJar = cookieJar || new jsdom.CookieJar();

  return {
    newPage,
  };

  function newPage() {
    return Page(agentOrApp, cookieJar);
  }
}

function Page(agentOrApp, cookieJar) {
  let url, dom, resources;
  const agent = agentOrApp.listen ?
      supertest.agent(agentOrApp) :
      agentOrApp;

  return {
    navigateTo,
    request,
    load,
    runScripts,
  };

  function navigateTo (_url, headers, jsdomConfig) {
    return request(_url, headers)
      .then(response => load(response, jsdomConfig));
  }

  function request (_url, headers = {}) {
    url = new URL(_url, "http://localhost:7411");
    return agent
      .get(url.pathname)
      .set({
        ...headers,
        cookie: cookieJar.getCookiesSync(url.href),
      });
  }

  function load (response, jsdomConfig = {}) {
    resources = jsdomConfig.resources || new jsdom.ResourceLoader();

    for (const setCookie of response.headers["set-cookie"] || []) {
      cookieJar.setCookieSync(setCookie, url.href);
    }

    return dom = new jsdom.JSDOM(response.text, {
      ...jsdomConfig,
      contentType: response.headers.contentType,
      url: url.href,
      resources,
      cookieJar,
      runScripts: "outside-only",
      beforeParse(window) {
        jsdomConfig.beforeParse && jsdomConfig.beforeParse(window);
      },
    });
  }

  async function runScripts() {
    const domContext = dom.getInternalVMContext();
    const fetchPolyfill = await fs.readFile(path.resolve("./node_modules/whatwg-fetch/dist/fetch.umd.js"), "utf8");
    vm.runInContext(fetchPolyfill, domContext);

    for (const scriptTag of dom.window.document.getElementsByTagName("script")) {
      const {src, text} = scriptTag;
      const code = src ? await resources.fetch(src, { cookieJar, element: scriptTag }) : text;
      const sourceFilePath = scriptTag.dataset.src;
      const entryModule = await Module(code, sourceFilePath, domContext);
      await entryModule.evaluate();
    }
  }
}

async function Module (pendingCode, identifier, context) {
  const code = await pendingCode;
  const mod = new vm.SourceTextModule(code.toString(), { identifier, context });
  await mod.link(async function (specifier, referencingModule) {
    const childPath = path.resolve(path.dirname(identifier), specifier);
    return Module(fs.readFile(childPath), childPath, referencingModule.context)
  });
  return mod;
}
