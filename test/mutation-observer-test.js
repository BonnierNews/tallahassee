"use strict";

const Script = require("@bonniernews/wichita");
const path = require("path");

const { app } = require("../app/app.js");
const Browser = require("../index.js");

describe("MutationObserver", () => {
  [
    { attributes: true },
    { characterData: true },
    { childList: true },
    { attributes: true, characterData: true, childList: true },
    { attributes: true, subtree: true },
    { characterData: true, subtree: true },
    { childList: true, subtree: true },
    { attributes: true, characterData: true, childList: true, subtree: true },
    {},
  ].forEach((options) => {
    describe(`options: ${JSON.stringify(options)}`, () => {
      const mutations = {
        attributes: 0,
        characterData: 0,
        childList: 0,
      };
      let browser, element;
      before(async () => {
        browser = await new Browser().load("<html/>");
        const observer = new browser.window.MutationObserver(recordMutations);
        element = browser.document.body;
        observer.observe(element, options);
      });

      it("no mutations", () => {
        expect(mutations).to.deep.equal({
          attributes: 0,
          characterData: 0,
          childList: 0,
        });
      });

      it("attribute mutation", () => {
        element.setAttribute("lang", "en");
        expect(mutations).to.deep.equal({
          attributes: options.attributes ? 1 : 0,
          characterData: 0,
          childList: 0,
        });
      });

      it("character data mutation", () => {
        element.textContent = "Welcome to…";
        expect(mutations).to.deep.equal({
          attributes: options.attributes ? 1 : 0,
          characterData: options.characterData ? 1 : 0,
          childList: 0,
        });
      });

      let childElement;
      it("child list mutation", () => {
        childElement = browser.document.createElement("a");
        element.appendChild(childElement);
        expect(mutations).to.deep.equal({
          attributes: options.attributes ? 1 : 0,
          characterData: options.characterData ? 1 : 0,
          childList: options.childList ? 1 : 0,
        });
      });

      it("attribute mutation in subtree", () => {
        childElement.setAttribute("href", "https://github.com/BonnierNews/tallahassee");
        expect(mutations).to.deep.equal(
          options.subtree ?
            {
              attributes: options.attributes ? 2 : 0,
              characterData: options.characterData ? 1 : 0,
              childList: options.childList ? 1 : 0,
            } :
            {
              attributes: options.attributes ? 1 : 0,
              characterData: options.characterData ? 1 : 0,
              childList: options.childList ? 1 : 0,
            }
        );
      });

      it("character data mutation in subtree", () => {
        childElement.textContent = "Tallahassee";
        expect(mutations).to.deep.equal(
          options.subtree ?
            {
              attributes: options.attributes ? 2 : 0,
              characterData: options.characterData ? 2 : 0,
              childList: options.childList ? 1 : 0,
            } :
            {
              attributes: options.attributes ? 1 : 0,
              characterData: options.characterData ? 1 : 0,
              childList: options.childList ? 1 : 0,
            }
        );
      });

      it("child list mutation in subtree", () => {
        const descendantElement = browser.document.createElement("img");
        descendantElement.src = "/banjo+hat.jpg";
        childElement.appendChild(descendantElement);
        expect(mutations).to.deep.equal(
          options.subtree ?
            {
              attributes: options.attributes ? 2 : 0,
              characterData: options.characterData ? 2 : 0,
              childList: options.childList ? 2 : 0,
            } :
            {
              attributes: options.attributes ? 1 : 0,
              characterData: options.characterData ? 1 : 0,
              childList: options.childList ? 1 : 0,
            }
        );
      });

      function recordMutations(mutationsList) {
        for (const { type } of mutationsList) {
          mutations[type]++;
        }
      }
    });
  });

  it("triggers when element has been inserted into the observed node using appendChild", async () => {
    const browser = await new Browser(app).navigateTo("/", { cookie: "_ga=1" });

    const targetNode = browser.document.getElementsByTagName("body")[0];
    const config = { attributes: true, childList: true };
    let childListMutation = false;
    function callback(mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          childListMutation = true;
        }
      }
    }
    const observer = new browser.window.MutationObserver(callback);
    observer.observe(targetNode, config);

    await new Script(path.resolve("app/assets/scripts/main.js")).run(browser.window);

    expect(childListMutation).to.be.ok;
  });

  it("triggers when element has been inserted into a child of the observed node using appendChild", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const targetNode = browser.document.getElementsByTagName("body")[0];
    const config = { childList: true, subtree: true };
    let childListMutation = false;
    const callback = function (mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          childListMutation = true;
        }
      }
    };
    const observer = new browser.window.MutationObserver(callback);
    observer.observe(targetNode, config);

    const p = browser.document.createElement("p");
    p.classList.add("set-by-js");
    p.textContent = "some text";
    browser.document.getElementById("header-1").appendChild(p);
    expect(childListMutation).to.be.ok;
  });

  it("triggers when element has been inserted into a grand child of the observed node using appendChild", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const targetNode = browser.document.getElementsByTagName("body")[0];
    const p = browser.document.createElement("p");
    p.classList.add("set-by-js");
    p.id = "my-elm";
    p.textContent = "some text";
    browser.document.getElementById("header-1").appendChild(p);

    const config = { childList: true, subtree: true };
    let childListMutation = false;
    const callback = function (mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          childListMutation = true;
        }
      }
    };
    const observer = new browser.window.MutationObserver(callback);
    observer.observe(targetNode, config);

    const span = browser.document.createElement("span");
    span.classList.add("set-by-js");
    span.textContent = "some other text";
    browser.document.getElementById("my-elm").appendChild(span);
    expect(childListMutation).to.be.ok;
  });

  it("triggers when element has been inserted into the observed node using insertAdjacentHTML(beforeend)", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const targetNode = browser.document.getElementsByTagName("body")[0];
    const config = { attributes: true, childList: true };
    let childListMutation = false;
    const callback = function (mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          childListMutation = true;
        }
      }
    };
    const observer = new browser.window.MutationObserver(callback);
    observer.observe(targetNode, config);

    targetNode.insertAdjacentHTML("beforeend", "<p>My paragraph</p>");
    expect(childListMutation).to.be.ok;
  });

  it("triggers when element has been inserted into the observed node using insertAdjacentHTML(afterbegin)", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const targetNode = browser.document.getElementsByTagName("body")[0];
    const config = { attributes: true, childList: true };
    let childListMutation = false;
    const callback = function (mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          childListMutation = true;
        }
      }
    };
    const observer = new browser.window.MutationObserver(callback);
    observer.observe(targetNode, config);

    targetNode.insertAdjacentHTML("afterbegin", "<p>My paragraph</p>");
    expect(childListMutation).to.be.ok;
  });

  it("doesn't trigger when element has been inserted into the observed node using insertAdjacentHTML(beforebegin)", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const targetNode = browser.document.getElementsByTagName("body")[0];
    const config = { attributes: true, childList: true };
    let childListMutation = false;
    const callback = function (mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          childListMutation = true;
        }
      }
    };
    const observer = new browser.window.MutationObserver(callback);
    observer.observe(targetNode, config);

    targetNode.insertAdjacentHTML("beforebegin", "<p>My paragraph</p>");
    expect(childListMutation).to.not.be.ok;
  });

  it("doesn't trigger when element has been inserted into the observed node using insertAdjacentHTML(afterend)", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const targetNode = browser.document.getElementsByTagName("body")[0];
    const config = { attributes: true, childList: true };
    let childListMutation = false;
    const callback = function (mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          childListMutation = true;
        }
      }
    };
    const observer = new browser.window.MutationObserver(callback);
    observer.observe(targetNode, config);

    targetNode.insertAdjacentHTML("afterend", "<p>My paragraph</p>");
    expect(childListMutation).to.not.be.ok;
  });

  it("triggers when element has been inserted into the observed node using insertBefore", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const targetNode = browser.document.getElementsByTagName("body")[0];
    const config = { attributes: true, childList: true };
    let childListMutation = false;
    const callback = function (mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          childListMutation = true;
        }
      }
    };
    const observer = new browser.window.MutationObserver(callback);
    observer.observe(targetNode, config);

    const p = browser.document.createElement("p");
    p.classList.add("set-by-js");
    p.textContent = "some text";
    const header = browser.document.getElementById("header-1");
    targetNode.insertBefore(p, header);
    expect(childListMutation).to.be.ok;
  });

  it("triggers when element has been inserted into the observed node using innerHTML", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const targetNode = browser.document.getElementsByTagName("body")[0];
    const config = { attributes: true, childList: true };
    let childListMutation = false;
    const callback = function (mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          childListMutation = true;
        }
      }
    };
    const observer = new browser.window.MutationObserver(callback);
    observer.observe(targetNode, config);

    targetNode.innerHTML = "<p>Foo</p>";
    expect(childListMutation).to.be.ok;
  });

  it("triggers when element has been inserted into the observed node using outerHTML", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const targetNode = browser.document.getElementsByTagName("body")[0];
    const config = { attributes: true, childList: true };
    let childListMutation = false;
    const callback = function (mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          childListMutation = true;
        }
      }
    };
    const observer = new browser.window.MutationObserver(callback);
    observer.observe(targetNode, config);

    targetNode.outerHTML = "<body><p>Foo</p></body>";
    expect(childListMutation).to.be.ok;
  });

  it("triggers when element has been inserted into the observed node using textContent", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const targetNode = browser.document.getElementsByTagName("body")[0];
    const config = { characterData: true };
    let characterDataMutation = false;
    const callback = function (mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.type === "characterData") {
          characterDataMutation = true;
        }
      }
    };
    const observer = new browser.window.MutationObserver(callback);
    observer.observe(targetNode, config);

    targetNode.textContent = "Foo";
    expect(characterDataMutation).to.be.ok;
  });

  it("triggers when element has been inserted into the observed node using innerText", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const targetNode = browser.document.getElementsByTagName("body")[0];
    const config = { characterData: true };
    let characterDataMutation = false;
    const callback = function (mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.type === "characterData") {
          characterDataMutation = true;
        }
      }
    };
    const observer = new browser.window.MutationObserver(callback);
    observer.observe(targetNode, config);

    targetNode.innerText = "Foo";
    expect(characterDataMutation).to.be.ok;
  });

  it("triggers when element has been removed from the observed node using removeChild", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const targetNode = browser.document.getElementsByTagName("body")[0];
    const elementToRemove = browser.document.createElement("div");
    targetNode.appendChild(elementToRemove);

    const config = { attributes: true, childList: true };
    let childListMutation = false;
    const callback = function (mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          childListMutation = true;
        }
      }
    };
    const observer = new browser.window.MutationObserver(callback);
    observer.observe(targetNode, config);

    targetNode.removeChild(elementToRemove);
    expect(childListMutation).to.be.ok;
  });

  it("disconnect() stops listening for mutations", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const targetNode = browser.document.getElementsByTagName("body")[0];
    const config = { attributes: true, childList: true };

    let childMutationCount = 0;

    const observer = new browser.window.MutationObserver(() => {
      ++childMutationCount;
    });
    observer.observe(targetNode, config);

    const p1 = browser.document.createElement("p");
    targetNode.appendChild(p1);

    observer.disconnect();

    const p2 = browser.document.createElement("p");
    targetNode.appendChild(p2);

    expect(childMutationCount).to.equal(1);
  });

  it("mutation callback (non-arrow) is called with mutation scope", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const targetNode = browser.document.getElementsByTagName("body")[0];
    const config = { attributes: true, childList: true };

    let scope;

    const observer = new browser.window.MutationObserver(function mutationCallback() {
      scope = this;
    });
    observer.observe(targetNode, config);

    const p1 = browser.document.createElement("p");
    targetNode.appendChild(p1);

    expect(scope === observer).to.be.true;
  });

  it("mutation callback this.disconnect() stops listening for mutations", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const targetNode = browser.document.getElementsByTagName("body")[0];
    const config = { attributes: true, childList: true };

    let childMutationCount = 0;

    const observer = new browser.window.MutationObserver(function mutated() {
      ++childMutationCount;
      this.disconnect();
    });
    observer.observe(targetNode, config);

    const p1 = browser.document.createElement("p");
    targetNode.appendChild(p1);

    const p2 = browser.document.createElement("p");
    targetNode.appendChild(p2);

    expect(childMutationCount).to.equal(1);
  });

  it("mutation when insertAdjacentHTML afterend triggers mutation on parent", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const sequence = [];
    const observer = new browser.window.MutationObserver(() => {
      sequence.push("mutated");
    });
    observer.observe(browser.document.body, { childList: true });

    const div = browser.document.createElement("div");

    browser.document.body.lastElementChild.insertAdjacentHTML("afterend", div);

    expect(sequence).to.eql([ "mutated" ]);
  });

  it("mutation when insertAdjacentHTML beforebegin triggers mutation on parent", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const sequence = [];
    const observer = new browser.window.MutationObserver(() => {
      sequence.push("mutated");
    });
    observer.observe(browser.document.body, { childList: true });

    const div = browser.document.createElement("div");

    browser.document.body.lastElementChild.insertAdjacentHTML("beforebegin", div);

    expect(sequence).to.eql([ "mutated" ]);
  });

  it("mutation when appendChild with script executes before mutation event", async () => {
    const browser = await new Browser(app).navigateTo("/");

    const sequence = browser.window.sequence = [];
    const config = { attributes: true, childList: true };
    const observer = new browser.window.MutationObserver(() => {
      sequence.push("mutated");
    });
    observer.observe(browser.document.body, config);

    const script = browser.document.createElement("script");
    script.textContent = "window.sequence.push(\"executed\");";

    browser.document.body.appendChild(script);

    expect(sequence).to.eql([ "executed", "mutated" ]);
  });

  describe("MutationObserverInit options", () => {
    let browser;
    beforeEach(async () => {
      browser = await new Browser(app).navigateTo("/");
    });

    it("observer with attributes option calls callback when element class changes", () => {
      const records = [];
      const observer = new browser.window.MutationObserver((mutatedRecords) => {
        records.push(...mutatedRecords);
      });
      observer.observe(browser.document.body, { attributes: true });

      browser.document.body.classList.add("mutate");

      expect(records).to.have.length(1);

      const record = records[0];
      expect(record).to.have.property("type", "attributes");
      expect(record).to.have.property("attributeName", "class");
      expect(record.target === browser.document.body).to.be.true;
    });

    it("observer with attributes option calls callback when element attributes changes", () => {
      browser.document.body.id = "existing";
      const records = [];
      const observer = new browser.window.MutationObserver((mutatedRecords) => {
        records.push(...mutatedRecords);
      });
      observer.observe(browser.document.body, { attributes: true });

      browser.document.body.attributes.id.value = "mutate";

      expect(records).to.have.length(1);

      const record = records[0];
      expect(record).to.have.property("type", "attributes");
      expect(record).to.have.property("attributeName", "id");
      expect(record.target === browser.document.body).to.be.true;
    });

    it("observer with attributes and subtree option calls callback when element child src changes", () => {
      const records = [];
      const observer = new browser.window.MutationObserver((mutatedRecords) => {
        records.push(...mutatedRecords);
      });
      observer.observe(browser.document.body, { attributes: true, subtree: true });

      const img = browser.document.getElementsByTagName("img")[0];
      img.src = "/images/tallahassee-2.png";

      expect(records).to.have.length(1);

      const record = records[0];
      expect(record).to.have.property("type", "attributes");
      expect(record).to.have.property("attributeName", "src");
      expect(record.target === img).to.be.true;
    });

    it("observer with attributes and subtree option calls callback when element child src changes", () => {
      const records = [];
      const observer = new browser.window.MutationObserver((mutatedRecords) => {
        records.push(...mutatedRecords);
      });
      observer.observe(browser.document.body, { attributes: true, subtree: true });

      const img = browser.document.getElementsByTagName("img")[0];
      img.src = "/images/tallahassee-2.png";

      expect(records).to.have.length(1);

      const record = records[0];
      expect(record).to.have.property("type", "attributes");
      expect(record).to.have.property("attributeName", "src");
      expect(record.target === img).to.be.true;
    });

    it("observer with attributes doesn't call callback when element children changes", () => {
      const records = [];
      const observer = new browser.window.MutationObserver((mutatedRecords) => {
        records.push(...mutatedRecords);
      });
      observer.observe(browser.document.body, { attributes: true });

      const div = browser.document.createElement("div");
      browser.document.body.appendChild(div);

      expect(records).to.have.length(0);
    });

    it("observer with attributes calls callback when element attribute is removed", () => {
      const records = [];
      const observer = new browser.window.MutationObserver((mutatedRecords) => {
        records.push(...mutatedRecords);
      });
      observer.observe(browser.document.body, { attributes: true });

      browser.document.body.setAttribute("setattr", "1");

      expect(records.length).to.equal(1);

      expect(records[0]).to.have.property("attributeName", "setattr");

      browser.document.body.removeAttribute("setattr");

      expect(records.length).to.equal(2);
      expect(records[1]).to.have.property("attributeName", "setattr");
    });

    it("observer with attributes doesn't call callback when non-existing element attribute is removed", () => {
      const records = [];
      const observer = new browser.window.MutationObserver((mutatedRecords) => {
        records.push(...mutatedRecords);
      });
      observer.observe(browser.document.body, { attributes: true });

      browser.document.body.setAttribute("setattr", "1");

      expect(records.length).to.equal(1);

      expect(records[0]).to.have.property("attributeName", "setattr");

      browser.document.body.removeAttribute("setattr");

      expect(records.length).to.equal(2);
      expect(records[1]).to.have.property("attributeName", "setattr");

      browser.document.body.removeAttribute("setattr");

      expect(records.length).to.equal(2);
    });

    it("observer with attributes calls callback when element dataset changes", () => {
      browser.document.body.setAttribute("data-count", "1");
      const records = [];
      const observer = new browser.window.MutationObserver((mutatedRecords) => {
        records.push(...mutatedRecords);
      });
      observer.observe(browser.document.body, { attributes: true });

      browser.document.body.dataset.count = "2";

      expect(records.length).to.equal(1);

      expect(records[0]).to.have.property("attributeName", "data-count");
    });
  });
});
