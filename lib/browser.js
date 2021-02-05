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
  const painter = Painter();
  let agent, url, dom, resources;

  return {
    navigateTo,
    request,
    load,
    paint: painter.paint,
    runScripts,
  };

  function navigateTo (_url, headers, jsdomConfig) {
    return request(_url, headers)
      .then(response => load(response, jsdomConfig));
  }

  function request (_url, headers = {}) {
    agent = agent || agentOrApp.listen ?
      supertest.agent(agentOrApp) :
      agentOrApp;

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
        applyExtensions(window);
        jsdomConfig.beforeParse && jsdomConfig.beforeParse(window);
      },
    });
  }

  function applyExtensions(window) {
    window.scrollTo = window.scroll = painter.scrollWindowTo;
    window.scrollBy = painter.scrollWindowBy;
    Object.defineProperties(window.Element.prototype, {
      getBoundingClientRect: { value: painter.getElementDomRect },
      scrollIntoView: { value: painter.scrollWindowToElement },
    });
    Object.defineProperties(window.HTMLElement.prototype, {
      offsetWidth: { get: painter.getElementDomRectWidth },
      offsetHeight: { get: painter.getElementDomRectHeight },
      offsetLeft: { get: painter.getElementDomRectX },
      offsetTop: { get: painter.getElementDomRectY },
    });
  }

  async function runScripts() {
    const domContext = dom.getInternalVMContext();
    const fetchPolyfill = await fs.readFile(path.resolve("./node_modules/whatwg-fetch/dist/fetch.umd.js"), "utf8");
    vm.runInContext(fetchPolyfill, domContext);

    for (const scriptTag of dom.window.document.getElementsByTagName("script")) {
      const {src, text} = scriptTag;
      const code = src ? await resources.fetch(src, { cookieJar }) : text;
      vm.runInContext(code, domContext);
    }
  }
}
