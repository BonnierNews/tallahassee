"use strict";

const Browser = require("../index.js");

describe("MutationObserver", () => {
  let mutations;
  beforeEach(() => {
    mutations = {
      count: {
        attributes: 0,
        childList: 0,
      },
      records: [],
    };
  });

  function recordMutations(mutationRecords) {
    for (const { type } of mutationRecords) {
      mutations.count[type]++;
    }
    mutations.records.push(...mutationRecords);
  }

  describe("new MutationObserver(callback)", () => {
    describe("mutationObserver.observe(target, options)", () => {
      it("mutationObserver.observe(targetN, optionsN)", async () => {
        const browser = await new Browser().load("<html/>");
        const observer = new browser.window.MutationObserver(recordMutations);

        const target = browser.document.createElement("p");
        observer.observe(target, { attributes: true });
        observer.observe(target, { childList: true });

        target.setAttribute("lang", "fl");
        target.textContent = "Welcome to Tallahassee!";

        expect(mutations.records.length).to.equal(2);
        expect(mutations.records[0]).to.deep.include({
          target,
          type: "attributes",
        });
        expect(mutations.records[1]).to.deep.include({
          target,
          type: "childList",
        });
      });

      it("mutationObserver.observe(target, optionsN)", async () => {
        const browser = await new Browser().load("<html/>");
        const observer = new browser.window.MutationObserver(recordMutations);

        const target1 = browser.document.createElement("p");
        observer.observe(target1, { attributes: true });

        const target2 = browser.document.createElement("p");
        observer.observe(target2, { childList: true });

        for (const target of [ target1, target2 ]) {
          target.setAttribute("lang", "fl");
          target.textContent = "Welcome to Tallahassee!";
        }

        expect(mutations.records.length).to.equal(2);
        expect(mutations.records[0]).to.deep.include({
          target: target1,
          type: "attributes",
        });
        expect(mutations.records[1]).to.deep.include({
          target: target2,
          type: "childList",
        });
      });

      [
        { attributes: true },
        { childList: true },
        { attributes: true, childList: true },
        { attributes: true, subtree: true },
        { childList: true, subtree: true },
        { attributes: true, childList: true, subtree: true },
      ].forEach((options) => {
        describe(`options: ${JSON.stringify(options)}`, () => {
          let browser, observer, element;
          before(async () => {
            browser = await new Browser().load("<html/>");
            element = browser.document.body;
            observer = new browser.window.MutationObserver(recordMutations);
            observer.observe(element, options);
          });

          it("no mutations", () => {
            expect(mutations.count).to.deep.equal({
              attributes: 0,
              childList: 0,
            });
          });

          it("attribute mutation", () => {
            element.setAttribute("lang", "en");
            expect(mutations.count).to.deep.equal({
              attributes: options.attributes ? 1 : 0,
              childList: 0,
            });
          });

          let childElement;
          it("child list mutation", () => {
            childElement = browser.document.createElement("a");
            element.appendChild(childElement);
            expect(mutations.count).to.deep.equal({
              attributes: 0,
              childList: options.childList ? 1 : 0,
            });
          });

          it("attribute mutation in subtree", () => {
            childElement.setAttribute("href", "https://github.com/BonnierNews/tallahassee");
            expect(mutations.count).to.deep.equal({
              attributes: options.attributes && options.subtree ? 1 : 0,
              childList: 0,
            });
          });

          it("child list mutation in subtree", () => {
            childElement.textContent = "Welcome to Tallahassee!";
            expect(mutations.count).to.deep.equal({
              attributes: 0,
              childList: options.subtree && options.childList ? 1 : 0,
            });
          });
        });
      });
    });

    describe("mutationObserver.disconnect()", () => {
      it("stops listening for all mutations", async () => {
        const browser = await new Browser().load("<html/>");
        const element = browser.document.body;
        const observer = new browser.window.MutationObserver(function () {
          expect(this).to.equal(observer);
          recordMutations.apply(this, arguments);
        });
        observer.observe(element, { attributes: true, childList: true, subtree: true });

        const childElement = browser.document.createElement("p");
        element.appendChild(childElement);
        childElement.setAttribute("lang", "fl");
        childElement.textContent = "Welcome to Tallahassee!";

        expect(mutations.count).to.deep.equal({
          attributes: 1,
          childList: 2,
        });

        observer.disconnect();

        childElement.setAttribute("lang", "en");
        childElement.textContent = "Goodbye!";

        expect(mutations.count).to.deep.equal({
          attributes: 1,
          childList: 2,
        });
      });
    });
  });

  describe("Mutations", () => {
    const allOptions = { attributes: true, childList: true, subtree: true };
    let browser, observer;
    beforeEach(async () => {
      browser = await new Browser().load(`
          <html>
            <body>
            <h1>Welcome to Tallahassee!</h1>
          </body>
        </html>
      `);

      observer = new browser.window.MutationObserver(recordMutations);
    });

    describe("type: attributes", () => {
      it("is triggered by Element.attributes.*.value = value", () => {
        const element = browser.document.body;
        browser.document.body.setAttribute("lang", "en");
        observer.observe(element, allOptions);

        browser.document.body.attributes.lang.value = "fl";

        expect(mutations.count).to.deep.equal({
          attributes: 1,
          childList: 0,
        });

        for (const mutationRecord of mutations.records) {
          expect(mutationRecord.target).to.equal(element);
          expect(mutationRecord.attributeName).to.equal("lang");
        }
      });

      it("is triggered by Element.classList.*(className)", () => {
        const element = browser.document.body;
        observer.observe(element, allOptions);

        element.classList.add("color-scheme-dark");
        element.classList.toggle("color-scheme-dark");
        element.classList.toggle("color-scheme-dark");
        element.classList.remove("color-scheme-dark");

        expect(mutations.count).to.deep.equal({
          attributes: 4,
          childList: 0,
        });

        for (const mutationRecord of mutations.records) {
          expect(mutationRecord.target).to.equal(element);
          expect(mutationRecord.attributeName).to.equal("class");
        }
      });

      it("is triggered by Element.setAttribute(name, value)", () => {
        const element = browser.document.body;
        observer.observe(element, allOptions);

        element.setAttribute("lang", "en");

        expect(mutations.count).to.deep.equal({
          attributes: 1,
          childList: 0,
        });

        for (const mutationRecord of mutations.records) {
          expect(mutationRecord.target).to.equal(element);
          expect(mutationRecord.attributeName).to.equal("lang");
        }
      });

      it("is triggered by Element.removeAttribute(name)", () => {
        const element = browser.document.body;
        element.setAttribute("lang", "en");

        observer.observe(element, allOptions);

        element.removeAttribute("lang");
        element.removeAttribute("lang");

        expect(mutations.count).to.deep.equal({
          attributes: 1,
          childList: 0,
        });

        for (const mutationRecord of mutations.records) {
          expect(mutationRecord.target).to.equal(element);
          expect(mutationRecord.attributeName).to.equal("lang");
        }
      });

      it("is triggered by HTMLElement.dataset.* = data", () => {
        const htmlElement = browser.document.body;
        observer.observe(htmlElement, allOptions);

        htmlElement.dataset.tallahassee = "fl";

        expect(mutations.count).to.deep.equal({
          attributes: 1,
          childList: 0,
        });

        for (const mutationRecord of mutations.records) {
          expect(mutationRecord.target).to.equal(htmlElement);
          expect(mutationRecord.attributeName).to.equal("data-tallahassee");
        }
      });

      it("is triggered by HTMLImageElement.src = src", () => {
        const htmlImageElement = browser.document.createElement("img");
        observer.observe(htmlImageElement, allOptions);

        htmlImageElement.src = "/images/tallahassee.png";

        expect(mutations.count).to.deep.equal({
          attributes: 1,
          childList: 0,
        });

        for (const mutationRecord of mutations.records) {
          expect(mutationRecord.target).to.equal(htmlImageElement);
          expect(mutationRecord.attributeName).to.equal("src");
        }
      });
    });

    describe("type: childList", () => {
      it("is triggered by Node.textContent = text", () => {
        const node = browser.document.querySelector("h1");
        observer.observe(node, allOptions);

        node.textContent = "Good bye!";

        expect(mutations.count).to.deep.equal({
          attributes: 0,
          childList: 1,
        });

        for (const mutationRecord of mutations.records) {
          expect(mutationRecord.target).to.equal(node);
        }
      });

      it("is triggered by Node.appendChild(child)", () => {
        const node = browser.document.body;
        observer.observe(node, allOptions);

        node.appendChild(browser.document.createElement("p"));

        expect(mutations.count).to.deep.equal({
          attributes: 0,
          childList: 1,
        });

        for (const mutationRecord of mutations.records) {
          expect(mutationRecord.target).to.equal(node);
        }
      });

      it("is triggered by Node.appendChild(htmlScriptElement)", () => {
        const sequence = browser.window.sequence = [];
        const node = browser.document.body;
        observer = new browser.window.MutationObserver(() => {
          sequence.push("mutation observer callback");
        });
        observer.observe(node, allOptions);

        const htmlScriptElement = browser.document.createElement("script");
        htmlScriptElement.textContent = "window.sequence.push('script execution');";
        node.appendChild(htmlScriptElement);

        expect(sequence).to.deep.equal([
          "script execution",
          "mutation observer callback",
        ]);
      });

      it("is triggered by Node.insertBefore(newNode, referenceNode)", () => {
        const node = browser.document.body;
        observer.observe(node, allOptions);

        node.insertBefore(
          browser.document.createElement("p"),
          node.firstChild
        );

        expect(mutations.count).to.deep.equal({
          attributes: 0,
          childList: 1,
        });

        for (const mutationRecord of mutations.records) {
          expect(mutationRecord.target).to.equal(node);
        }
      });

      it("is triggered by Node.removeChild(child)", () => {
        const node = browser.document.body;
        observer.observe(node, allOptions);

        node.removeChild(node.firstChild);

        expect(mutations.count).to.deep.equal({
          attributes: 0,
          childList: 1,
        });

        for (const mutationRecord of mutations.records) {
          expect(mutationRecord.target).to.equal(node);
        }
      });

      it("is triggered by Element.innerHTML = html", () => {
        const element = browser.document.body;
        observer.observe(element, allOptions);

        element.innerHTML = "<p />";

        expect(mutations.count).to.deep.equal({
          attributes: 0,
          childList: 1,
        });

        for (const mutationRecord of mutations.records) {
          expect(mutationRecord.target).to.equal(element);
        }
      });

      it("is triggered by Element.outerHTML = html", () => {
        const element = browser.document.body;
        const { parentElement } = element;
        observer.observe(parentElement, allOptions);

        element.outerHTML = "<p />";

        expect(mutations.count).to.deep.equal({
          attributes: 0,
          childList: 1,
        });

        for (const mutationRecord of mutations.records) {
          expect(mutationRecord.target).to.equal(parentElement);
        }
      });

      [
        [ "beforebegin", true ],
        [ "afterbegin", false ],
        [ "beforeend", false ],
        [ "afterend", true ],
      ].forEach(([ position, outside ]) => {
        it(`is triggered by Element.insertAdjacentElement("${position}", element)`, () => {
          const element = browser.document.body;
          observer.observe(outside ? element.parentElement : element, allOptions);

          element.insertAdjacentElement(position, browser.document.createElement("p"));

          expect(mutations.count).to.deep.equal({
            attributes: 0,
            childList: 1,
          });

          for (const mutationRecord of mutations.records) {
            expect(mutationRecord.target).to.equal(outside ? element.parentElement : element);
          }
        });
      });

      [
        [ "beforebegin", true ],
        [ "afterbegin", false ],
        [ "beforeend", false ],
        [ "afterend", true ],
      ].forEach(([ position, outside ]) => {
        it(`is triggered by Element.insertAdjacentHTML("${position}", text)`, () => {
          const element = browser.document.body;
          observer.observe(outside ? element.parentElement : element, allOptions);

          element.insertAdjacentHTML(position, "<p />");

          expect(mutations.count).to.deep.equal({
            attributes: 0,
            childList: 1,
          });

          for (const mutationRecord of mutations.records) {
            expect(mutationRecord.target).to.equal(outside ? element.parentElement : element);
          }
        });
      });

      it("is triggered by HTMLElement.innerText = text", () => {
        const htmlElement = browser.document.querySelector("h1");
        observer.observe(htmlElement, allOptions);

        htmlElement.innerText = "Good bye!";

        expect(mutations.count).to.deep.equal({
          attributes: 0,
          childList: 1,
        });

        for (const mutationRecord of mutations.records) {
          expect(mutationRecord.target).to.equal(htmlElement);
        }
      });
    });
  });
});
