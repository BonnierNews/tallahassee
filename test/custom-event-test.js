"use strict";

const app = require("../app/app");
const Browser = require("../");
const {Compiler, CustomEvent} = require("../lib");

describe("CustomEvent", () => {
  before(() => {
    Compiler.Compiler([/assets\/scripts/]);
  });

  it("creates an object with the expected properties", async () => {
    const browser = await Browser(app).navigateTo("/", {
      Cookie: "_ga=1"
    });

    browser.window.CustomEvent = CustomEvent;

    const daEvent = new browser.window.CustomEvent("myEvent", {
      detail: "Blahonga!"
    });

    let dispatchedEvent;
    browser.window.addEventListener("myEvent", (event) => {
      dispatchedEvent = event;
    });
    browser.window.dispatchEvent(daEvent);

    expect(dispatchedEvent).to.be.ok;
    expect(dispatchedEvent).to.have.property("detail", "Blahonga!");
  });

  it("supports old skool initCustomEvent (so that it's possible to test code that polyfills IE)", async () => {
    const browser = await Browser(app).navigateTo("/", {
      Cookie: "_ga=1"
    });

    let dispatchedEvent;
    browser.window.addEventListener("myEvent", (arg) => {
      dispatchedEvent = arg;
    });
    browser.window.document.createEvent = () => {
      return new CustomEvent();
    };

    const evt = browser.window.document.createEvent("CustomEvent");
    evt.initCustomEvent("myEvent", false, false, { detail: "Blahonga!" });
    browser.window.dispatchEvent(evt);

    expect(dispatchedEvent).to.be.ok;
    expect(dispatchedEvent).to.have.property("type", "myEvent");
    expect(dispatchedEvent).to.have.property("detail", "Blahonga!");
  });
});
