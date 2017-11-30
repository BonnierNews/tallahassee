"use strict";

const Document = require("./lib/Document");
const Fetch = require("./lib/Fetch");
const supertest = require("supertest");
const Window = require("./lib/Window");
const {compile} = require("./lib/Compiler");

module.exports = Tallahassee;

function Tallahassee(app) {
  return {
    navigateTo,
    load
  };

  function navigateTo(linkUrl, headers = {}) {
    const req = supertest(app).get(linkUrl);
    for (const key in headers) {
      req.set(key, headers[key]);
    }
    return req
      .expect("Content-Type", /text\/html/i)
      .expect(200)
      .then(load);
  }

  function load(resp) {
    compile();

    const window = Window(resp, {
      fetch: Fetch(app, resp),
    });
    const document = Document(resp);

    const browserContext = {
      window,
      document,
      $: document.$
    };

    global.window = window;
    global.document = document;

    return browserContext;
  }
}
