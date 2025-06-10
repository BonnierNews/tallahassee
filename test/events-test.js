"use strict";

const { app } = require("../app/app.js");
const Browser = require("../index.js");

describe("Events", () => {
  describe("Event", () => {
    describe("preventDefault", () => {
      it("sets indication of default action prevented on cancelable event", async () => {
        const browser = await new Browser(app).navigateTo("/");
        let interceptedEvent;
        browser.window.addEventListener("load", interceptEvent);
        browser.window.addEventListener("click", interceptEvent);
        function interceptEvent(event) {
          event.preventDefault();
          interceptedEvent = event;
        }

        const nonCancelableEvent = new browser.window.Event("load");
        expect(nonCancelableEvent).to.be.have.property("cancelable", false);
        expect(nonCancelableEvent).to.be.have.property("defaultPrevented", false);

        browser.window.dispatchEvent(nonCancelableEvent);
        expect(interceptedEvent).to.be.ok;
        expect(interceptedEvent).to.be.have.property("defaultPrevented", false);

        const cancelableEvent = new browser.window.Event("click", { cancelable: true });
        expect(cancelableEvent).to.be.have.property("cancelable", true);
        expect(cancelableEvent).to.be.have.property("defaultPrevented", false);

        browser.window.dispatchEvent(cancelableEvent);
        expect(interceptedEvent).to.be.ok;
        expect(interceptedEvent).to.be.have.property("defaultPrevented", true);
      });
    });
  });

  describe("CustomEvent", () => {
    it("creates an object with the expected properties", async () => {
      const browser = await new Browser(app).navigateTo("/");

      let interceptedEvent;
      browser.window.addEventListener("myEvent", (event) => {
        interceptedEvent = event;
      });

      browser.window.dispatchEvent(
        new browser.window.CustomEvent("myEvent")
      );
      expect(interceptedEvent).to.be.ok;
      expect(interceptedEvent).to.have.property("detail", null);
      expect(interceptedEvent).to.have.property("bubbles", false);
      expect(interceptedEvent).to.have.property("cancelable", false);

      browser.window.dispatchEvent(
        new browser.window.CustomEvent("myEvent", {
          detail: "Blahonga!",
          bubbles: true,
          cancelable: true,
        })
      );
      expect(interceptedEvent).to.have.property("detail", "Blahonga!");
      expect(interceptedEvent).to.have.property("bubbles", true);
      expect(interceptedEvent).to.have.property("cancelable", true);
    });

    it("supports old school initCustomEvent (so that it's possible to test code that polyfills IE)", async () => {
      const browser = await new Browser(app).navigateTo("/");

      let interceptedEvent;
      browser.window.addEventListener("myEvent", (event) => {
        interceptedEvent = event;
      });
      browser.window.document.createEvent = (type) => {
        return new browser.window[type]();
      };

      const event = browser.window.document.createEvent("CustomEvent");
      event.initCustomEvent("myEvent", true, true, "Blahonga!");
      browser.window.dispatchEvent(event);

      expect(interceptedEvent).to.be.ok;
      expect(interceptedEvent).to.have.property("type", "myEvent");
      expect(interceptedEvent).to.have.property("detail", "Blahonga!");
      expect(interceptedEvent).to.have.property("bubbles", true);
      expect(interceptedEvent).to.have.property("cancelable", true);
    });
  });

  describe("bubbling", () => {
    it("bubbles from event target to window", async () => {
      const browser = await new Browser(app).navigateTo("/");

      const hits = {
        window: 0,
        document: 0,
        documentElement: 0,
        body: 0,
      };
      browser.window.addEventListener("myEvent", () => ++hits.window);
      browser.window.document.addEventListener("myEvent", () => ++hits.document);
      browser.window.document.documentElement.addEventListener("myEvent", () => ++hits.documentElement);
      browser.window.document.body.addEventListener("myEvent", () => ++hits.body);

      const target = browser.window.document.querySelector("body *");
      expect(target).to.be.ok;
      target.dispatchEvent(new browser.window.CustomEvent("myEvent", { bubbles: true }));

      expect(hits).to.deep.equal({
        window: 1,
        document: 1,
        documentElement: 1,
        body: 1,
      });
    });
  });
});
