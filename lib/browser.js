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
    cookieJar,
  };

  function newPage() {
    return Page(agentOrApp, cookieJar);
  }
}

function Page(agentOrApp, cookieJar) {
  let url;
  const agent = agentOrApp.listen ?
      supertest.agent(agentOrApp) :
      agentOrApp;

  return {
    navigateTo,
    request,
    load,
  };

  function navigateTo (_url, headers, jsdomConfig) {
    return request(_url, headers)
      .then(response => load(response, jsdomConfig));
  }

  function request (requestUrl, headers = {}) {
    url = new URL(requestUrl, "http://localhost:7411");
    return agent
      .get(url.pathname)
      .set({
        ...headers,
        cookie: cookieJar.getCookiesSync(url.href),
      });
  }

  function load (response, jsdomConfig = {}) {
    for (const setCookie of response.headers["set-cookie"] || []) {
      cookieJar.setCookieSync(setCookie, url.href);
    }

    return new jsdom.JSDOM(response.text, {
      ...jsdomConfig,
      contentType: response.headers.contentType,
      url: url.href,
      cookieJar,
      runScripts: "outside-only",
      beforeParse(window) {
        jsdomConfig.beforeParse && jsdomConfig.beforeParse(window);
      },
    });
  }
}
