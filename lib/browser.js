import { promises as fs } from "fs";
import { URL } from "url";
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
  let agent, dom, resources;
  let origin = "http://localhost:7411";

  return {
    navigateTo,
    request,
    load,
    paint: painter.paint,
    runScripts,
  };

  function navigateTo (url, headers, jsdomConfig = {}) {
    return request(url, headers)
      .expect(200)
      .expect("content-type", "text/html; charset=utf-8")
      .then(response => {
        const setCookies = response.headers["set-cookie"];
        for (const setCookie of setCookies || []) {
          cookieJar.setCookieSync(setCookie, url);
        }

        return load(response.text, {
          contentType: response.headers.contentType,
          ...jsdomConfig,
        });
      });
  }

  function request (url, headers = {}) {
    agent = agent || agentOrApp.listen ?
      supertest.agent(agentOrApp) :
      agentOrApp;

    const absoluteUrl = url.startsWith("/") ? origin + url : url;
    const parsedUrl = new URL(absoluteUrl);
    origin = parsedUrl.origin;

    return agent
      .get(parsedUrl.pathname)
      .set({
        ...headers,
        cookie: cookieJar.getCookiesSync(parsedUrl.href),
      });
  }

  function load (domString, jsdomConfig = {}) {
    resources = jsdomConfig.resources || new jsdom.ResourceLoader();
    cookieJar = cookieJar || jsdomConfig.cookieJar;
    return dom = new jsdom.JSDOM(domString, {
      url: origin,
      ...jsdomConfig,
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
