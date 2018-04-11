"use strict";

const intersectionCalc = require("../lib/intersectionCalc");

describe("Intersection Calc", () => {
  describe("getRootMargin", () => {
    const {getRootMargin} = intersectionCalc;

    it("handles undefined argument", () => {
      const result = getRootMargin();
      expect(result).to.eql({top: 0, right: 0, bottom: 0, left: 0});
    });

    it("handles undefined margin value", () => {
      const result = getRootMargin({});
      expect(result).to.eql({top: 0, right: 0, bottom: 0, left: 0});
    });

    it("handles empty margin value", () => {
      const result = getRootMargin({rootMargin: ""});
      expect(result).to.eql({top: 0, right: 0, bottom: 0, left: 0});
    });

    it("handles one margin pixel value", () => {
      const result = getRootMargin({rootMargin: "1px"});
      expect(result).to.eql({top: 1, right: 1, bottom: 1, left: 1});
    });

    it("handles two margin pixel values", () => {
      const result = getRootMargin({rootMargin: "1px 2px"});
      expect(result).to.eql({top: 1, right: 2, bottom: 1, left: 2});
    });

    it("handles three margin pixel values", () => {
      const result = getRootMargin({rootMargin: "1px 2px 3px"});
      expect(result).to.eql({top: 1, right: 2, bottom: 3, left: 2});
    });

    it("handles four margin pixel values", () => {
      const result = getRootMargin({rootMargin: "1px 2px 3px 4px"});
      expect(result).to.eql({top: 1, right: 2, bottom: 3, left: 4});
    });

    it("handles negative margin pixel values", () => {
      const result = getRootMargin({rootMargin: "-1px -2px -3px -4px"});
      expect(result).to.eql({top: -1, right: -2, bottom: -3, left: -4});
    });
  });

  describe("getIntersectionRatio", () => {
    const {getIntersectionRatio} = intersectionCalc;

    describe("with no rootMargin", () => {
      it("returns 1 when fully inside window (at the top)", () => {
        const result = getIntersectionRatio({top: 0, height: 100}, 400);
        expect(result).to.equal(1);
      });

      it("returns 1 when fully inside window (at the bottom)", () => {
        const result = getIntersectionRatio({top: 300, height: 100}, 400);
        expect(result).to.equal(1);
      });

      it("returns 0.5 when partially inside window (above)", () => {
        const result = getIntersectionRatio({top: -50, height: 100}, 400);
        expect(result).to.equal(0.5);
      });

      it("returns 0.5 when partially inside window (below)", () => {
        const result = getIntersectionRatio({top: 350, height: 100}, 400);
        expect(result).to.equal(0.5);
      });

      it("returns 0 when above window", () => {
        const result = getIntersectionRatio({top: -100, height: 100}, 400);
        expect(result).to.equal(0);
      });

      it("returns 0 when below window", () => {
        const result = getIntersectionRatio({top: 400, height: 100}, 400);
        expect(result).to.equal(0);
      });
    });

    describe("with positive rootMargin.top", () => {
      const rootMargin = { top: 100 };
      it("returns 1 when fully inside window with margins (at the top)", () => {
        const result = getIntersectionRatio({top: -100, height: 100}, 400, rootMargin);
        expect(result).to.equal(1);
      });

      it("returns 1 when fully inside window with margins (at the bottom)", () => {
        const result = getIntersectionRatio({top: 300, height: 100}, 400, rootMargin);
        expect(result).to.equal(1);
      });

      it("returns 0.5 when partially inside window with margins (above)", () => {
        const result = getIntersectionRatio({top: -150, height: 100}, 400, rootMargin);
        expect(result).to.equal(0.5);
      });

      it("returns 0.5 when partially inside window with margins (below)", () => {
        const result = getIntersectionRatio({top: 350, height: 100}, 400, rootMargin);
        expect(result).to.equal(0.5);
      });

      it("returns 0 when above window with margins", () => {
        const result = getIntersectionRatio({top: -200, height: 100}, 400, rootMargin);
        expect(result).to.equal(0);
      });

      it("returns 0 when below window with margins", () => {
        const result = getIntersectionRatio({top: 400, height: 100}, 400, rootMargin);
        expect(result).to.equal(0);
      });
    });

    describe("with negative rootMargin.top", () => {
      const rootMargin = { top: -100 };
      it("returns 1 when fully inside window with margins (at the top)", () => {
        const result = getIntersectionRatio({top: 100, height: 100}, 400, rootMargin);
        expect(result).to.equal(1);
      });

      it("returns 1 when fully inside window with margins (at the bottom)", () => {
        const result = getIntersectionRatio({top: 300, height: 100}, 400, rootMargin);
        expect(result).to.equal(1);
      });

      it("returns 0.5 when partially inside window (above)", () => {
        const result = getIntersectionRatio({top: 50, height: 100}, 400, rootMargin);
        expect(result).to.equal(0.5);
      });

      it("returns 0.5 when partially inside window (below)", () => {
        const result = getIntersectionRatio({top: 350, height: 100}, 400, rootMargin);
        expect(result).to.equal(0.5);
      });

      it("returns 0 when above window", () => {
        const result = getIntersectionRatio({top: 0, height: 100}, 400, rootMargin);
        expect(result).to.equal(0);
      });

      it("returns 0 when below window", () => {
        const result = getIntersectionRatio({top: 400, height: 100}, 400, rootMargin);
        expect(result).to.equal(0);
      });
    });

    describe("with positive rootMargin.bottom", () => {
      const rootMargin = { bottom: 100 };
      it("returns 1 when fully inside window with margins (at the top)", () => {
        const result = getIntersectionRatio({top: 0, height: 100}, 400, rootMargin);
        expect(result).to.equal(1);
      });

      it("returns 1 when fully inside window with margins (at the bottom)", () => {
        const result = getIntersectionRatio({top: 400, height: 100}, 400, rootMargin);
        expect(result).to.equal(1);
      });

      it("returns 0.5 when partially inside window with margins (above)", () => {
        const result = getIntersectionRatio({top: -50, height: 100}, 400, rootMargin);
        expect(result).to.equal(0.5);
      });

      it("returns 0.5 when partially inside window with margins (below)", () => {
        const result = getIntersectionRatio({top: 450, height: 100}, 400, rootMargin);
        expect(result).to.equal(0.5);
      });

      it("returns 0 when above window with margins", () => {
        const result = getIntersectionRatio({top: -100, height: 100}, 400, rootMargin);
        expect(result).to.equal(0);
      });

      it("returns 0 when below window with margins", () => {
        const result = getIntersectionRatio({top: 500, height: 100}, 400, rootMargin);
        expect(result).to.equal(0);
      });
    });

    describe("with negative rootMargin.bottom", () => {
      const rootMargin = { bottom: -100 };
      it("returns 1 when fully inside window with margins (at the top)", () => {
        const result = getIntersectionRatio({top: 0, height: 100}, 400, rootMargin);
        expect(result).to.equal(1);
      });

      it("returns 1 when fully inside window with margins (at the bottom)", () => {
        const result = getIntersectionRatio({top: 200, height: 100}, 400, rootMargin);
        expect(result).to.equal(1);
      });

      it("returns 0.5 when partially inside window with margins (above)", () => {
        const result = getIntersectionRatio({top: -50, height: 100}, 400, rootMargin);
        expect(result).to.equal(0.5);
      });

      it("returns 0.5 when partially inside window with margins (below)", () => {
        const result = getIntersectionRatio({top: 250, height: 100}, 400, rootMargin);
        expect(result).to.equal(0.5);
      });

      it("returns 0 when above window with margins", () => {
        const result = getIntersectionRatio({top: -100, height: 100}, 400, rootMargin);
        expect(result).to.equal(0);
      });

      it("returns 0 when below window with margins ", () => {
        const result = getIntersectionRatio({top: 300, height: 100}, 400, rootMargin);
        expect(result).to.equal(0);
      });
    });
  });
});
