"use strict";

const app = require("../app/app");
const Browser = require("../");
const Script = require("@bonniernews/wichita");
const {MutationObserver} = require("../lib");

describe("MutationObserver", () => {
  it("triggers when element has been inserted into the observed node using appendChild", async () => {
    const browser = await Browser(app).navigateTo("/", {
      Cookie: "_ga=1"
    });

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
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    await Script("../app/assets/scripts/main").run(browser.window);

    expect(childListMutation).to.be.ok;
  });

  it("triggers when element has been inserted into a child of the observed node using appendChild", async () => {
    const browser = await Browser(app).navigateTo("/");

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
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    const p = browser.document.createElement("p");
    p.classList.add("set-by-js");
    p.textContent = "some text";
    browser.document.getElementById("header-1").appendChild(p);
    expect(childListMutation).to.be.ok;
  });

  it("triggers when element has been inserted into a grand child of the observed node using appendChild", async () => {
    const browser = await Browser(app).navigateTo("/");

    const targetNode = browser.document.getElementsByTagName("body")[0];
    const p = browser.document.createElement("p");
    p.classList.add("set-by-js");
    p.id = "my-elm";
    p.textContent = "some text";
    browser.document.getElementById("header-1").appendChild(p);

    const config = { attributes: true, childList: true };
    let childListMutation = false;
    const callback = function (mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          childListMutation = true;
        }
      }
    };
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    const span = browser.document.createElement("span");
    span.classList.add("set-by-js");
    span.textContent = "some other text";
    browser.document.getElementById("my-elm").appendChild(span);
    expect(childListMutation).to.be.ok;
  });

  it("triggers when element has been inserted into the observed node using insertAdjacentHTML(beforeend)", async () => {
    const browser = await Browser(app).navigateTo("/");

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
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    targetNode.insertAdjacentHTML("beforeend", "<p>My paragraph</p>");
    expect(childListMutation).to.be.ok;
  });

  it("triggers when element has been inserted into the observed node using insertAdjacentHTML(afterbegin)", async () => {
    const browser = await Browser(app).navigateTo("/");

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
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    targetNode.insertAdjacentHTML("afterbegin", "<p>My paragraph</p>");
    expect(childListMutation).to.be.ok;
  });

  it("doesn't trigger when element has been inserted into the observed node using insertAdjacentHTML(beforebegin)", async () => {
    const browser = await Browser(app).navigateTo("/");

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
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    targetNode.insertAdjacentHTML("beforebegin", "<p>My paragraph</p>");
    expect(childListMutation).to.not.be.ok;
  });

  it("doesn't trigger when element has been inserted into the observed node using insertAdjacentHTML(afterend)", async () => {
    const browser = await Browser(app).navigateTo("/");

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
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    targetNode.insertAdjacentHTML("afterend", "<p>My paragraph</p>");
    expect(childListMutation).to.not.be.ok;
  });

  it("triggers when element has been inserted into the observed node using insertBefore", async () => {
    const browser = await Browser(app).navigateTo("/");

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
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    const p = browser.document.createElement("p");
    p.classList.add("set-by-js");
    p.textContent = "some text";
    const header = browser.document.getElementById("header-1");
    targetNode.insertBefore(p, header);
    expect(childListMutation).to.be.ok;
  });

  it("triggers when element has been inserted into the observed node using innerHTML", async () => {
    const browser = await Browser(app).navigateTo("/");

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
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    targetNode.innerHTML = "<p>Foo</p>";
    expect(childListMutation).to.be.ok;
  });

  it("triggers when element has been inserted into the observed node using outerHTML", async () => {
    const browser = await Browser(app).navigateTo("/");

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
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    targetNode.outerHTML = "<body><p>Foo</p></body>";
    expect(childListMutation).to.be.ok;
  });

  it("triggers when element has been inserted into the observed node using textContent", async () => {
    const browser = await Browser(app).navigateTo("/");

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
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    targetNode.textContent = "Foo";
    expect(childListMutation).to.be.ok;
  });

  it("triggers when element has been inserted into the observed node using innerText", async () => {
    const browser = await Browser(app).navigateTo("/");

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
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    targetNode.innerText = "Foo";
    expect(childListMutation).to.be.ok;
  });

  it("triggers when element has been removed from the observed node using removeChild", async () => {
    const browser = await Browser(app).navigateTo("/");

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
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    targetNode.removeChild(elementToRemove);
    expect(childListMutation).to.be.ok;
  });

  it("disconnect() stops listening for mutations", async () => {
    const browser = await Browser(app).navigateTo("/");

    const targetNode = browser.document.getElementsByTagName("body")[0];
    const config = { attributes: true, childList: true };

    let childMutationCount = 0;

    const observer = new MutationObserver(() => {
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
    const browser = await Browser(app).navigateTo("/");

    const targetNode = browser.document.getElementsByTagName("body")[0];
    const config = { attributes: true, childList: true };

    let scope;

    const observer = new MutationObserver(function mutationCallback() {
      scope = this;
    });
    observer.observe(targetNode, config);

    const p1 = browser.document.createElement("p");
    targetNode.appendChild(p1);

    expect(scope === observer).to.be.true;
  });

  it("mutation callback this.disconnect() stops listening for mutations", async () => {
    const browser = await Browser(app).navigateTo("/");

    const targetNode = browser.document.getElementsByTagName("body")[0];
    const config = { attributes: true, childList: true };

    let childMutationCount = 0;

    const observer = new MutationObserver(function mutated() {
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
    const browser = await Browser(app).navigateTo("/");

    const sequence = [];
    const observer = new MutationObserver(() => {
      sequence.push("mutated");
    });
    observer.observe(browser.document.body, {childList: true });

    const div = browser.document.createElement("div");

    browser.document.body.lastElementChild.insertAdjacentHTML("afterend", div);

    expect(sequence).to.eql(["mutated"]);
  });

  it("mutation when insertAdjacentHTML beforebegin triggers mutation on parent", async () => {
    const browser = await Browser(app).navigateTo("/");

    const sequence = [];
    const observer = new MutationObserver(() => {
      sequence.push("mutated");
    });
    observer.observe(browser.document.body, {childList: true });

    const div = browser.document.createElement("div");

    browser.document.body.lastElementChild.insertAdjacentHTML("beforebegin", div);

    expect(sequence).to.eql(["mutated"]);
  });

  it("mutation when appendChild with script executes before mutation event", async () => {
    const browser = await Browser(app).navigateTo("/");

    const sequence = browser.window.sequence = [];
    const config = { attributes: true, childList: true };
    const observer = new MutationObserver(() => {
      sequence.push("mutated");
    });
    observer.observe(browser.document.body, config);

    const script = browser.document.createElement("script");
    script.textContent = "window.sequence.push(\"executed\");";

    browser.document.body.appendChild(script);

    expect(sequence).to.eql(["executed", "mutated"]);
  });

  describe("MutationObserverInit options", () => {
    let browser;
    beforeEach(async () => {
      browser = await Browser(app).navigateTo("/");
    });

    it("observer with attributes option calls callback when element class changes", () => {
      const records = [];
      const observer = new MutationObserver((mutatedRecords) => {
        records.push(...mutatedRecords);
      });
      observer.observe(browser.document.body, {attributes: true});

      browser.document.body.classList.add("mutate");

      expect(records).to.have.length(1);

      const record = records[0];
      expect(record).to.have.property("type", "attributes");
      expect(record).to.have.property("attributeName", "class");
      expect(record.target === browser.document.body).to.be.true;
    });

    it("observer with attributes and subtree option calls callback when element child src changes", () => {
      const records = [];
      const observer = new MutationObserver((mutatedRecords) => {
        records.push(...mutatedRecords);
      });
      observer.observe(browser.document.body, {attributes: true, subtree: true});

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
      const observer = new MutationObserver((mutatedRecords) => {
        records.push(...mutatedRecords);
      });
      observer.observe(browser.document.body, {attributes: true, subtree: true});

      const img = browser.document.getElementsByTagName("img")[0];
      img.src = "/images/tallahassee-2.png";

      expect(records).to.have.length(1);

      const record = records[0];
      expect(record).to.have.property("type", "attributes");
      expect(record).to.have.property("attributeName", "src");
      expect(record.target === img).to.be.true;
    });
  });
});
