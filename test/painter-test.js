"use strict";

const Painter = require("../lib/painter.js");
const { JSDOM } = require("jsdom");
const { strict: assert } = require("assert");

describe("Painter", () => {
  describe("Web APIs", () => {
    let dom, element;
    beforeEach("load DOM", () => {
      dom = new JSDOM("<div>HTMLElement</div>");
      element = dom.window.document.querySelector("div");
    });

    let painter;
    beforeEach("initialize painter", () => {
      painter = Painter().init(dom.window);
    });

    beforeEach("paint non-default layout", () => {
      painter.paint(element, {
        x: 50,
        y: 20,
        width: 150,
        height: 250,
      });
    });

    describe("Element", () => {
      beforeEach("is instance of Element", () => {
        assert.equal(element instanceof dom.window.Element, true, "expected instance of Element");
      });

      it(".getBoundingClientRect()", () => {
        assert.deepEqual(element.getBoundingClientRect(), {
          width: 150,
          height: 250,
          x: 50,
          y: 20,
          left: 50,
          right: 200,
          top: 20,
          bottom: 270,
        });
      });
    });

    describe("HTMLElement", () => {
      beforeEach("is instance of HTMLElement", () => {
        assert.equal(element instanceof dom.window.HTMLElement, true, "expected instance of HTMLElement");
      });

      it(".offsetLeft", () => {
        assert.equal(element.offsetLeft, 50);
      });

      it(".offsetTop", () => {
        assert.equal(element.offsetTop, 20);
      });

      it(".offsetWidth", () => {
        assert.equal(element.offsetWidth, 150);
      });

      it(".offsetHeight", () => {
        assert.equal(element.offsetHeight, 250);
      });
    });
  });

  describe("options.stylesheet", () => {
    before("defaults bounding box values to 0", async () => {
      const dom = new JSDOM("<div>HTMLElement</div>");
      Painter().init(dom.window);

      const element = dom.window.document.querySelector("div");
      assert.deepEqual(element.getBoundingClientRect(), {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      });
    });

    it("styles multiple elements", async () => {
      const dom = new JSDOM(`
        <div>HTMLElement</div>
        <div>HTMLElement</div>
      `);
      const stylesheet = {
        "*": { x: 50, y: 20, width: 150, height: 250 },
      };
      Painter({ stylesheet }).init(dom.window);

      const matchingElements = dom.window.document.querySelectorAll("*");
      for (const element of matchingElements) {
        assert.deepEqual(element.getBoundingClientRect(), {
          width: 150,
          height: 250,
          x: 50,
          y: 20,
          left: 50,
          right: 200,
          top: 20,
          bottom: 270,
        });
      }
    });

    it("compounds multiple matching styles", async () => {
      const dom = new JSDOM(`
        <h1>A heading</h1>
        <p>A paragraph…</p>
      `);
      const stylesheet = {
        "*": { width: 375 },
        "h1": { height: 36 },
        "p": { height: 160, y: 36 },
      };
      Painter({ stylesheet }).init(dom.window);

      const [ h1, p ] = dom.window.document.body.children;
      assert.deepEqual(h1.getBoundingClientRect(), {
        width: 375,
        height: 36,
        x: 0,
        y: 0,
        left: 0,
        right: 375,
        top: 0,
        bottom: 36,
      });
      assert.deepEqual(p.getBoundingClientRect(), {
        width: 375,
        height: 160,
        x: 0,
        y: 36,
        left: 0,
        right: 375,
        top: 36,
        bottom: 196,
      });
    });

    it("uses selector specificity to resolve conflicting styles", async () => {
      const dom = new JSDOM(`
        <h1 id="the-heading" class="heading">
          A heading
        </h1>
      `);
      const stylesheet = {
        "#the-heading": { height: 30 },
        "h1, h2": { height: 10 },
        ".heading": { height: 20 },
        "*": { height: 0 },
      };
      Painter({ stylesheet }).init(dom.window);

      const h1 = dom.window.document.body.querySelector("h1");
      assert.deepEqual(h1.offsetHeight, 30);
    });

    it("element styles trump stylesheet styles", async () => {
      const dom = new JSDOM(`
        <div id="element">HTMLElement</div>
      `);
      const stylesheet = {
        "#element": { width: 100, height: 100 },
      };
      const painter = Painter({ stylesheet }).init(dom.window);

      const element = dom.window.document.getElementById("element");
      painter.paint(element, { width: 200 });
      assert.deepEqual(element.offsetWidth, 200);
      assert.deepEqual(element.offsetHeight, 100);
    });
  });

  describe(".paint", () => {
    let painter, elements;
    beforeEach(() => {
      const dom = new JSDOM(`
        <div>HTMLElement</div>
      `);
      painter = Painter().init(dom.window);
      elements = dom.window.document.querySelectorAll("div");
    });

    it("paints element", () => {
      const [ element ] = elements;
      painter.paint(element, { height: 16, y: 10 });
      assert.equal(element.offsetHeight, 16);
      assert.equal(element.offsetTop, 10);
    });

    it("paints elements with selector", () => {
      painter.paint("div", { height: 16, y: 10 });
      for (const element of elements) {
        assert.equal(element.offsetHeight, 16);
        assert.equal(element.offsetTop, 10);
      }
    });

    it("repaints element, updating element styles", () => {
      const [ element ] = elements;
      painter.paint(element, { height: 16, y: 10 });
      assert.equal(element.offsetHeight, 16);
      assert.equal(element.offsetTop, 10);

      painter.paint(element, { height: 32 });
      assert.equal(element.offsetHeight, 32);
      assert.equal(element.offsetTop, 10);
    });

    it("repaints elements with selector, replacing stylesheet entry", () => {
      painter.paint("div", { height: 16, y: 10 });
      for (const element of elements) {
        assert.equal(element.offsetHeight, 16);
        assert.equal(element.offsetTop, 10);
      }

      painter.paint("div", { height: 32 });
      for (const element of elements) {
        assert.equal(element.offsetHeight, 32);
        assert.equal(element.offsetTop, 0);
      }
    });
  });
});
