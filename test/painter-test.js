import {strict as assert} from "assert";
import Browser from "../index.js";

describe("painter", () => {
  describe("dimensions", () => {
    let page, dom;
    before("load DOM", async () => {
      page = Browser().newPage();
      dom = page.load(`
        <div>HTMLElement</div>
      `);
    });

    let element;
    before(() => {
      element = dom.window.document.querySelector("div");
      assert(element, "expected element");
      page.paint(element, {
        x: 50,
        y: 20,
        width: 150,
        height: 250,
      });
    });

    describe("Element", () => {
      before("is instance of Element", () => {
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
      before("is instance of HTMLElement", () => {
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
});
