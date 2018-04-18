"use strict";

const app = require("../app/app");
const Browser = require("../");
const {Compiler, MutationObserver} = require("../lib");

describe("MutationObserver", () => {
  before(() => {
    Compiler.Compiler([/assets\/scripts/]);
  });

  it("triggers when element has been inserted into the observed node using appendChild", async () => {
    const browser = await Browser(app).navigateTo("/", {
      Cookie: "_ga=1"
    });

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

    require("../app/assets/scripts/main");

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
});
