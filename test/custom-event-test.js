"use strict";

const { app } = require("../app/app.js");
const Browser = require("../index.js");

describe("CustomEvent", () => {
  it("creates an object with the expected properties", async () => {
    const browser = await new Browser(app).navigateTo("/", { cookie: "_ga=1" });

    const daEvent = new browser.window.CustomEvent("myEvent", { detail: "Blahonga!" });

    let dispatchedEvent;
    browser.window.addEventListener("myEvent", (event) => {
      dispatchedEvent = event;
    });
    browser.window.dispatchEvent(daEvent);

    expect(dispatchedEvent).to.be.ok;
    expect(dispatchedEvent).to.have.property("detail", "Blahonga!");
  });

  it("supports old school initCustomEvent (so that it's possible to test code that polyfills IE)", async () => {
    const browser = await new Browser(app).navigateTo("/", { cookie: "_ga=1" });

    let dispatchedEvent;
    browser.window.addEventListener("myEvent", (arg) => {
      dispatchedEvent = arg;
    });
    browser.window.document.createEvent = () => {
      return new browser.window.CustomEvent();
    };

    const evt = browser.window.document.createEvent("CustomEvent");
    evt.initCustomEvent("myEvent", false, false, "Blahonga!");
    browser.window.dispatchEvent(evt);

    expect(dispatchedEvent).to.be.ok;
    expect(dispatchedEvent).to.have.property("type", "myEvent");
    expect(dispatchedEvent).to.have.property("detail", "Blahonga!");
  });
});
