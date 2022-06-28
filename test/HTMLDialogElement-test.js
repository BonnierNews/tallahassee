"use strict";

const {Document} = require("../lib");
const {Event} = require("../lib/Events");

describe("HTMLDialogElement", () => {
  let document;
  beforeEach(() => {
    document = new Document({
      text: `
        <html>
          <body>
            <dialog>
              <p>Test</p>
            </dialog>
          </body>
        </html>`
    });
  });

  it("can read open property", () => {
    const [dialog] = document.getElementsByTagName("dialog");
    expect(dialog.open).to.be.false;
  });

  it("can set open property", () => {
    const [dialog] = document.getElementsByTagName("dialog");
    expect(dialog.open = true).to.be.true;
  });

  describe("Methods", () => {
    it("showModal() sets open", () => {
      const [dialog] = document.getElementsByTagName("dialog");
      expect(dialog.open).to.be.false;

      dialog.showModal();
      expect(dialog.open).to.be.true;
    });

    it("close() removes open", () => {
      const [dialog] = document.getElementsByTagName("dialog");
      dialog.open = true;
      expect(dialog.open).to.be.true;

      dialog.close();
      expect(dialog.open).to.be.false;
    });
  });

  describe("Events", () => {
    it("close() fires close event", (done) => {
      const [dialog] = document.getElementsByTagName("dialog");

      dialog.addEventListener("close", () => done());

      dialog.close();
    });

    it("pressing escape fires cancel event", () => {
      const [dialog] = document.getElementsByTagName("dialog");

      let i = 0;
      dialog.addEventListener("cancel", () => i++);

      const evt = new Event("keypress");
      evt.keyCode = 32;
      document.dispatchEvent(evt);
      expect(i).to.equal(0);

      evt.keyCode = 27;
      document.dispatchEvent(evt);
      expect(i).to.equal(1);
    });
  });
});
