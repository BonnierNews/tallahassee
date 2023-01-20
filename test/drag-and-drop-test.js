import { app } from "../app/app.js";
import Browser from "../index.js";

describe("drag and drop", () => {
  let browser;
  beforeEach(async () => {
    browser = await new Browser(app).navigateTo("/dnd");
  });

  it("can read draggable property", () => {
    const divs = browser.document.getElementsByTagName("div");

    expect(divs[0].draggable).to.equal(true);
    expect(divs[1].draggable).to.equal(false);
  });

  it("can set draggable property", () => {
    const divs = browser.document.getElementsByTagName("div");

    expect(divs[0].draggable = false).to.equal(false);
    expect(divs[1].draggable = true).to.equal(true);
  });

  it("can read droppable property", () => {
    const divs = browser.document.getElementsByTagName("div");

    expect(divs[0].droppable).to.equal(false);
    expect(divs[1].droppable).to.equal(true);
  });

  it("can set droppable property", () => {
    const divs = browser.document.getElementsByTagName("div");

    expect(divs[0].droppable = true).to.equal(true);
    expect(divs[1].droppable = false).to.equal(false);
  });

  describe("events", () => {
    it("dispatches start event when dragging", (done) => {
      const [ draggable ] = browser.document.getElementsByTagName("div");
      draggable.addEventListener("dragstart", (e) => {
        expect(e.target).to.equal(draggable);
        done();
      });
      browser.dragStart(draggable);
    });

    it("does not dispatch start event when dragging non-draggable", () => {
      const [ , droppable ] = browser.document.getElementsByTagName("div");
      droppable.addEventListener("dragstart", () => {
        throw new Error("dragstart event fired");
      });
      expect(() => browser.dragStart(droppable)).to.throw();
    });

    it("dispatches drag event when dragging", (done) => {
      const [ draggable ] = browser.document.getElementsByTagName("div");
      draggable.addEventListener("drag", (e) => {
        const { target, x, y } = e;
        expect(target).to.equal(draggable);
        expect(x).to.equal(50);
        expect(y).to.equal(100);
        done();
      });
      browser.dragStart(draggable);
      browser.drag(50, 100);
    });

    it("dispatches drag event on element when dragging", (done) => {
      const [ draggable, droppable ] = browser.document.getElementsByTagName("div");
      draggable.addEventListener("drag", (e) => {
        const { target, x, y } = e;
        expect(target).to.equal(draggable);
        expect(x).to.equal(200);
        expect(y).to.equal(100);
        done();
      });
      browser.dragStart(draggable);
      droppable._setBoundingClientRect({ top: 100, left: 200 });
      browser.drag(droppable);
    });

    it("dispatches end event when dragging", (done) => {
      const [ draggable, droppable ] = browser.document.getElementsByTagName("div");
      draggable.addEventListener("dragend", (e) => {
        expect(e.target).to.equal(draggable);
        done();
      });
      browser.dragStart(draggable);
      browser.drag(droppable);
      browser.dragEnd();
    });

    it("dispatches over event when dragging", (done) => {
      const [ draggable, droppable ] = browser.document.getElementsByTagName("div");
      droppable.addEventListener("dragover", (e) => {
        expect(e.target).to.equal(droppable);
        done();
      });
      browser.dragStart(draggable);
      browser.drag(droppable);
    });

    it("dispatches drop event when dropping if prevented default", (done) => {
      const [ draggable, droppable ] = browser.document.getElementsByTagName("div");
      droppable.addEventListener("dragover", (e) => {
        e.preventDefault();
      });
      droppable.addEventListener("drop", (e) => {
        expect(e.target).to.equal(droppable);
        done();
      });
      browser.dragStart(draggable);
      browser.drag(droppable);
      browser.dragEnd();
    });

    it("does not dispatch drop event when dropping if not prevented default", () => {
      const [ draggable, droppable ] = browser.document.getElementsByTagName("div");
      droppable.addEventListener("drop", () => {
        throw new Error("drop event fired");
      });
      browser.dragStart(draggable);
      browser.drag(droppable);
      browser.dragEnd();
    });
  });
});
