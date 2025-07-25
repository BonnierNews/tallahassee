"use strict";

const DocumentFragment = require("../lib/DocumentFragment.js");
const Element = require("../lib/Element.js");
const Window = require("../lib/Window.js");
const HTMLAnchorElement = require("../lib/HTMLAnchorElement.js");
const HTMLFormElement = require("../lib/HTMLFormElement.js");
const { Document } = require("../lib/index.js");
const { Event } = require("../lib/Events.js");

const elementProperties = [
  "children",
  "classList",
  "className",
  "firstChild",
  "firstElementChild",
  "id",
  "lastChild",
  "lastElementChild",
  "name",
  "nodeType",
  "innerHTML",
  "offsetHeight",
  "outerHTML",
  "style",
  "tagName",
  "type",
  "nextElementSibling",
];

const elementApi = [
  "contains",
  "getElementsByTagName",
  "getElementsByClassName",
  "getBoundingClientRect",
  "matches",
  "remove",
];

describe("elements", () => {
  describe("Properties", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        url: "https://www.expressen.se/",
        text: `
          <html>
            <head>
              <link href="/style.css">
              <link href="//bootstrap.local/style.css">
              <link>
            </head>
            <body>
              <h1>Elements</h1>
              <h2 id="headline">Test</h2>
              <input type="button">
              <script>var a = 1;</script>
              <img style="display: none;height:0">

              <a href="//example.com">Absolute link no protocol</a>
              <a href="http://example.com">Absolute link with protocol</a>
              <a href="/slug/">Relative link</a>
              <a href="/?signed_out=true">Relative link with query parameter</a>

              <img class="test-src" src="//example.com/img.png">
              <img class="test-no-src">
              <img class="test-empty-src" src="">
              <iframe class="test-src" src="http://example.com">Absolute frame with protocol</iframe>
              <iframe class="test-src" src="/slug/">Relative frame</iframe>
              <iframe class="test-src" src="/qs/?widget=malservice">Relative frame with query parameter</iframe>
              <span>Text <b>bold</b> and some</span>
            </body>
          </html>`,
      });
    });

    it("element should have property tagName", () => {
      const children = document.body.children;
      expect(children).to.have.length.above(0);
      for (const elm of children) {
        expect(elm).to.have.property("tagName").that.match(/[A-Z]+/);
      }
    });

    it("element should have property attributes", () => {
      const elm = document.getElementsByTagName("h1")[0];
      expect(elm.attributes.length).to.equal(0);
    });

    it("element should have property attributes with existing", () => {
      const elm = document.getElementsByClassName("test-src")[0];

      expect(elm.attributes.length).to.equal(2);
      expect(elm.attributes.class.name).to.equal("class");
      expect(elm.attributes.class.value).to.equal("test-src");
      expect(elm.attributes.src.name).to.equal("src");
      expect(elm.attributes.src.value).to.equal("//example.com/img.png");

      expect(elm.attributes[0].name).to.equal("class");
      expect(elm.attributes[0].value).to.equal("test-src");
      expect(elm.attributes[1].name).to.equal("src");
      expect(elm.attributes[1].value).to.equal("//example.com/img.png");
    });

    it("element should have modifiable value property in attributes", () => {
      const elm = document.getElementsByTagName("h2")[0];

      expect(elm.attributes.length).to.equal(1);
      expect(elm.attributes.id.name).to.equal("id");
      expect(elm.attributes.id.value).to.equal("headline");

      expect(() => (elm.attributes.id.name = "test")).to.throw();

      elm.attributes.id.value = "test";
      expect(elm.attributes.id.value).to.equal("test");
    });

    it("element id should be the empty string when not set", () => {
      const elm = document.getElementsByTagName("h1")[0];
      expect(elm.id).to.eql("");
      expect(elm.getAttribute("id")).to.eql(null);
    });

    elementProperties.forEach((name) => {
      it(`"${name}" should exist`, () => {
        const children = document.body.children;
        expect(children).to.have.length.above(0);
        for (const elm of children) {
          expect(elm, elm.tagName).to.have.property(name);
        }
      });
    });

    describe("className", () => {
      it("exposes className with the expected behaviour", () => {
        const [ elm ] = document.getElementsByTagName("h1");
        expect(elm.className).to.equal("");

        elm.className = "class-name";
        expect(elm.className).to.equal("class-name");

        elm.className += " another-class-name";
        expect(elm.className).to.equal("class-name another-class-name");
      });
    });

    describe("classList", () => {
      let elm;

      beforeEach(() => {
        [ elm ] = document.getElementsByTagName("h1");
      });

      it("exposes classList with the expected behaviour", () => {
        expect(elm.classList).to.be.ok;
        elm.classList.add("class-list");

        expect(elm.classList._classes).to.contain("class-list");

        elm.classList.toggle("class-list");
        expect(elm.classList._classes).to.not.contain("class-list");

        elm.classList.toggle("class-list", false);
        expect(elm.classList._classes).to.not.contain("class-list");

        elm.classList.toggle("class-list", true);
        expect(elm.classList._classes).to.contain("class-list");

        elm.classList.toggle("class-list");
        expect(elm.classList._classes).to.not.contain("class-list");

        elm.classList.add("class-list", "second-class");
        expect(elm.classList._classes).to.include.members([ "class-list", "second-class" ]);

        elm.classList.remove("class-list", "second-class");
        expect(elm.classList._classes).to.not.include.members([ "class-list", "second-class" ]);
      });

      it("exposes hook for manipulating element when class is added", () => {
        expect(elm.style).to.not.have.property("display");
        elm.addEventListener("_classadded", (...classNames) => {
          if (classNames.includes("hidden")) {
            elm.style.display = "none";
          }
        });

        elm.classList.add("hidden");
        expect(elm.style).to.have.property("display", "none");
      });

      it("exposes hook for manipulating element when class is removed", () => {
        elm.style.position = "fixed";

        elm.addEventListener("_classremoved", (...classNames) => {
          if (classNames.includes("sticky")) {
            elm.style.position = "relative";
          }
        });

        elm.classList.remove("sticky");
        expect(elm.style).to.have.property("position", "relative");
      });
    });

    it("exposes disabled with the expected behaviour on input element", () => {
      const elm = document.getElementsByTagName("input")[0];
      expect(elm).to.have.property("disabled").that.is.false;
      elm.disabled = true;
      expect(elm.outerHTML).to.equal("<input type=\"button\" disabled=\"disabled\">");
      elm.disabled = false;
      expect(elm.outerHTML).to.equal("<input type=\"button\">");
    });

    it("exposes anchors with the expected behaviour", () => {
      const anchors = document.getElementsByTagName("a");
      expect(anchors[0]).to.be.instanceof(HTMLAnchorElement);
      expect(anchors[0]).to.have.property("href", "https://example.com/");
      expect(anchors[0].toString()).to.equal("https://example.com/");

      expect(anchors[1]).to.have.property("href", "http://example.com/");
      expect(anchors[2]).to.have.property("href", "https://www.expressen.se/slug/");
      expect(anchors[3]).to.have.property("href", "https://www.expressen.se/?signed_out=true");
    });

    it("exposes .src with the expected behaviour", () => {
      const sources = document.getElementsByClassName("test-src");
      expect(sources[0]).to.have.property("src", "https://example.com/img.png");
      expect(sources[1]).to.have.property("src", "http://example.com/");
      expect(sources[2]).to.have.property("src", "https://www.expressen.se/slug/");
      expect(sources[3]).to.have.property("src", "https://www.expressen.se/qs/?widget=malservice");
      sources[0].src = "/img/set.gif";
      expect(sources[0]).to.have.property("src", "https://www.expressen.se/img/set.gif");

      const noSource = document.getElementsByClassName("test-no-src")[0];
      expect(noSource, "no src").to.have.property("src", "");

      const emptySource = document.getElementsByClassName("test-empty-src")[0];
      expect(emptySource, "empty src").to.have.property("src", "");
    });

    it("triggers load event when setting .src", () => {
      const images = document.getElementsByTagName("img");
      const img1 = images[0];
      const img2 = images[1];

      img1.imageLoaded = "false";
      img2.imageLoaded = "false";

      img1.addEventListener("load", () => (img1.imageLoaded = "true"));
      img2.addEventListener("load", () => (img2.imageLoaded = "true"));

      img2.src = "/img/setImage2.gif";
      expect(img1).to.have.property("imageLoaded", "false");
      expect(img2).to.have.property("imageLoaded", "true");
    });

    describe("nodeType", () => {
      it("should return the correct node type", () => {
        expect(document.getElementsByTagName("span")[0].nodeType).to.equal(1);
      });

      it("cannot be changed", () => {
        const elm = document.getElementsByTagName("span")[0];
        elm.nodeType = 3;
        expect(elm.nodeType).to.equal(1);
      });

      it("should return the correct node type for text node", () => {
        const elm = document.getElementsByTagName("span")[0];
        expect(elm.firstChild.nodeType).to.equal(3);
      });
    });

    describe("childNodes", () => {
      it("return all child nodes including text", () => {
        const span = document.getElementsByTagName("span")[0];
        const childNodes = span.childNodes;
        expect(childNodes.length).to.equal(3);

        expect(childNodes[0].nodeType).to.equal(3);
        expect(childNodes[1].nodeType).to.equal(1);
        expect(childNodes[2].nodeType).to.equal(3);
      });

      it("returns the same nodes if called again", () => {
        const span = document.getElementsByTagName("span")[0];
        const call1 = span.childNodes;
        const call2 = span.childNodes;

        expect(call2.length).to.equal(3).and.equal(call1.length);

        expect(call1[0] === call2[0]).to.be.true;
        expect(call1[1] === call2[1]).to.be.true;
        expect(call1[2] === call2[2]).to.be.true;
      });
    });

    describe("parentNode", () => {
      it("returns parent node", () => {
        const span = document.getElementsByTagName("span")[0];
        expect(span.parentNode === document.body).to.be.true;
      });

      it("body parent node is document.documentElement", () => {
        expect(document.body.parentNode === document.documentElement).to.be.true;
      });
    });
  });

  describe("Methods", () => {
    describe("getElementsByClassName(className)", () => {
      let document;
      beforeEach(() => {
        document = new Document({
          text: `
            <html>
              <body>
                <div class="row"></div>
                <div class="row row--boat">
                  <span class="row--boat">Wide</span>
                </div>
              </body>
            </html>`,
        });
      });

      it("returns elements that match class name", () => {
        const elms = document.body.getElementsByClassName("row");
        expect(elms.length).to.equal(2);
      });

      it("returns elements that match class names separated by blank", () => {
        const elms = document.body.getElementsByClassName("row row--boat");
        expect(elms.length).to.equal(1);
      });

      it("returns elements that match class names separated any number of whitespaces", () => {
        const elms = document.body.getElementsByClassName("row \n\t     row--boat   \n\t ");
        expect(elms.length).to.equal(1);
      });
    });

    describe("querySelector(selector)", () => {
      let element;
      beforeEach(() => {
        const document = new Document({
          text: `
            <section>
              <div class="row"></div>
              <div class="row row--boat">
                <span class="row--boat">Wide</span>
              </div>
            </section>
          `,
        });
        element = document.getElementsByTagName("section")[0];
      });

      it("returns element", () => {
        expect(element.querySelector(".row span").tagName).to.equal("SPAN");
      });

      it("returns null if selector is not found", () => {
        expect(element.querySelector(".no-exist")).to.be.null;
      });
    });

    describe("querySelectorAll(selector)", () => {
      let element;
      beforeEach(() => {
        const document = new Document({
          text: `
            <section>
              <div class="row"></div>
              <div class="row row--boat">
                <span class="row--boat">Wide</span>
              </div>
            </section>
          `,
        });
        element = document.getElementsByTagName("section")[0];
      });

      it("returns array of elements", () => {
        const list = element.querySelectorAll(".row");
        expect(list.length).to.equal(2);
        expect(list[0].tagName).to.equal("DIV");
      });

      it("list is not live", () => {
        const list = element.querySelectorAll(".row");
        expect(list.length).to.equal(2);
        list[1].insertAdjacentHTML("afterend", "<div class='row'>new</div>");
        expect(list.length).to.equal(2);
      });

      it("returns new list each time", () => {
        const list = element.querySelectorAll(".row");
        expect(element.querySelectorAll(".row") === list).to.be.false;
      });

      it("returns empty if selector is not found", () => {
        expect(element.querySelectorAll(".no-exist").length).to.equal(0);
      });
    });

    describe("appendChild(aChild)", () => {
      let document;
      beforeEach(() => {
        const window = new Window({});
        document = new Document({
          text: `
            <html>
              <body id="grandparent">
                <span class="child">åäö</span>
                <div id="parent-1"></div>
                <div id="parent-2"></div>
              </body>
            </html>`,
        }, null, window);
      });

      it("moves existing child", () => {
        const child = document.getElementsByClassName("child")[0];
        const parent1 = document.getElementById("parent-1");
        const parent2 = document.getElementById("parent-2");

        parent1.appendChild(child);
        expect(document.getElementsByClassName("child").length).to.equal(1);
        expect(child.parentElement).to.have.property("id", "parent-1");

        parent2.appendChild(child);
        expect(document.getElementsByClassName("child").length).to.equal(1);
        expect(child.parentElement).to.have.property("id", "parent-2");
      });

      it("inserts new child", () => {
        const elm = document.createElement("span");
        elm.dataset.json = JSON.stringify({ data: 1 });
        elm.textContent = "åäö";
        document.body.appendChild(elm);

        const newElm = document.body.lastElementChild;

        expect(newElm.outerHTML).to.equal("<span data-json=\"{\"data\":1}\">åäö</span>");
        expect(newElm.dataset.json).to.equal("{\"data\":1}");
        expect(JSON.parse(newElm.dataset.json)).to.eql({ data: 1 });
      });

      it("executes if script", () => {
        const elm = document.createElement("script");
        elm.innerText = "window.appended = true;";

        document.body.appendChild(elm);

        expect(document.defaultView.appended).to.be.true;
      });
    });

    describe("removeChild(child)", () => {
      let document;
      beforeEach(() => {
        document = new Document({
          text: `
            <html>
              <body id="grandparent">
                <div id="parent-1">
                  <span class="child">åäö</span>
                </div>
                <div id="parent-2"></div>
              </body>
            </html>`,
        });
      });

      it("removes child element and returns remove child ref", () => {
        const parent = document.getElementById("parent-1");
        const child = document.getElementsByClassName("child")[0];
        expect(parent.children.length).to.equal(1);

        const removed = parent.removeChild(child);
        expect(parent.children.length).to.equal(0);

        expect(removed === child).to.be.true;
      });

      it("removes child text node", () => {
        const parent = document.getElementsByClassName("child")[0];
        const child = parent.firstChild;
        expect(child.nodeType).to.equal(3);

        expect(parent.childNodes.length).to.equal(1);

        const removed = parent.removeChild(child);
        expect(parent.childNodes.length).to.equal(0);

        expect(removed === child).to.be.true;
      });

      it("throws if removed twice", () => {
        const parent = document.getElementsByClassName("child")[0];
        const child = parent.firstChild;
        const removed = parent.removeChild(child);

        expect(() => {
          parent.removeChild(removed);
        }).to.throw(DOMException, "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.");
      });
    });
  });

  describe("replaceChild(newChild, oldChild)", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body id="grandparent">
              <div id="parent-1">
                <span class="child">åäö</span>
              </div>
              <div id="parent-2"></div>
            </body>
          </html>`,
      });
    });

    it("removes child element and replaces it with the new one", () => {
      const parent = document.getElementById("parent-1");
      const child = document.getElementsByClassName("child")[0];

      expect(parent.children.length).to.equal(1);

      const newChild = document.createElement("p");
      newChild.textContent = "I will replace you";
      const removed = parent.replaceChild(newChild, child);
      expect(parent.children.length).to.equal(1);
      expect(parent.textContent.trim()).to.equal("I will replace you");

      expect(removed === child).to.be.true;
    });

    it("replace child text node", () => {
      const parent = document.getElementsByClassName("child")[0];
      const child = parent.firstChild;
      expect(child.nodeType).to.equal(3);

      expect(parent.childNodes.length).to.equal(1);

      const newChild = document.createElement("p");
      newChild.textContent = "I will replace you";
      const removed = parent.replaceChild(newChild, child);
      expect(parent.childNodes.length).to.equal(1);

      expect(removed === child).to.be.true;
    });
  });

  describe("replaceChildren(newChild)", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body id="grandparent">
              <div id="parent-1">
                <span class="child">åäö</span>
              </div>
              <div id="parent-2"></div>
            </body>
          </html>`,
      });
    });

    it("removes all children if no arguments supplied", () => {
      const parent = document.getElementById("parent-1");

      expect(parent.children.length).to.equal(1);

      parent.replaceChildren();
      expect(parent.children.length).to.equal(0);
    });

    it("replaces all children with new child", () => {
      const parent = document.getElementById("grandparent");
      expect(parent.children.length).to.equal(2);

      const newChild = document.createElement("p");
      newChild.textContent = "I will replace you";

      parent.replaceChildren(newChild);
      expect(parent.childNodes.length).to.equal(1);
      expect(parent.textContent.trim()).to.equal("I will replace you");
      expect(parent.innerHTML).to.equal("<p>I will replace you</p>");
    });

    it("replaces all children with new children", () => {
      const parent = document.getElementById("grandparent");
      expect(parent.children.length).to.equal(2);

      const newChild = document.createElement("p");
      newChild.textContent = "First";
      const newChild2 = document.createElement("p");
      newChild2.textContent = "Second";
      const newChild3 = document.createElement("p");
      newChild3.textContent = "Third";

      parent.replaceChildren(newChild, newChild2, newChild3);
      expect(parent.childNodes.length).to.equal(3);
      expect(parent.innerHTML).to.equal("<p>First</p><p>Second</p><p>Third</p>");
    });
  });

  describe("replaceWith()", () => {
    let document;
    let parent;
    let span;

    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <div id="parent">
                <span class="child">åäö</span>
              </div>
            </body>
          </html>`,
      });
      parent = document.getElementById("parent");
      span = parent.getElementsByTagName("span")[0];
    });

    it("replaces element in the children list of its parent with the supplied element", () => {
      const p = document.createElement("p");
      p.textContent = "New text";
      span.replaceWith(p);
      expect(parent.innerHTML.trim()).to.equal("<p>New text</p>");
    });

    it("replaces element in the children list of its parent with the supplied elements", () => {
      const p = document.createElement("p");
      p.textContent = "New text";
      const p2 = document.createElement("p");
      p2.textContent = "A new row";
      span.replaceWith(p, p2);
      expect(parent.innerHTML.trim()).to.equal("<p>New text</p><p>A new row</p>");
    });

    it("removes the element from the parent if no new element is supplied", () => {
      span.replaceWith();
      expect(parent.innerHTML.trim()).to.equal("");
    });

    [ "a new value", undefined, null ].forEach((value) => {
      it(`replaces the element in the parent with the string ${value} if ${value} is passed to the function`, () => {
        span.replaceWith(value);
        expect(parent.innerHTML.trim()).to.equal(String(value));
      });
    });

    it("replaces element in the children list of its parent with the supplied strings", () => {
      span.replaceWith("1 ", "2");
      expect(parent.innerHTML.trim()).to.equal("1 2");
    });
  });

  describe(".style", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <h2 id="headline">Test</h2>
              <img style="display: none;height:0; -moz-transition-duration: 12ms">
            </body>
          </html>`,
      });
    });

    it("exposes style with the expected behaviour", () => {
      const [ elm ] = document.getElementsByTagName("h2");
      expect(elm).to.have.property("style").that.eql({});
      elm.style.display = "none";
      expect(elm.outerHTML).to.equal("<h2 id=\"headline\" style=\"display: none;\">Test</h2>");
      elm.style.removeProperty("display");
      expect(elm.outerHTML).to.equal("<h2 id=\"headline\">Test</h2>");

      const [ img ] = document.getElementsByTagName("img");
      expect(img.style).to.eql({
        mozTransitionDuration: "12ms",
        display: "none",
        height: "0",
      });

      img.style.height = "12px";
      img.style.width = "0";
      expect(img.getAttribute("style")).to.equal("display: none;height: 12px;-moz-transition-duration: 12ms;width: 0;");
    });

    it("handles setting camel cased properties", () => {
      const [ elm ] = document.getElementsByTagName("h2");

      elm.style.mozTransitionDuration = "6s";
      expect(elm.outerHTML).to.equal("<h2 id=\"headline\" style=\"-moz-transition-duration: 6s;\">Test</h2>");
      elm.style.removeProperty("mozTransitionDuration");
      expect(elm.outerHTML).to.equal("<h2 id=\"headline\">Test</h2>");

      elm.style.msGridColumns = "auto auto";
      expect(elm.outerHTML).to.equal("<h2 id=\"headline\" style=\"-ms-grid-columns: auto auto;\">Test</h2>");

      elm.style.marginTop = 0;
      expect(elm.outerHTML).to.equal("<h2 id=\"headline\" style=\"-ms-grid-columns: auto auto;margin-top: 0;\">Test</h2>");
    });

    it("handles empty string as reset value", () => {
      const [ elm ] = document.getElementsByTagName("img");
      expect(elm.style.display).to.equal("none");

      elm.style.display = "";
      expect(elm.style.display).to.equal("");
    });

    it("handles null as reset value", () => {
      const [ elm ] = document.getElementsByTagName("img");
      expect(elm.style.display).to.equal("none");

      elm.style.display = null;
      expect(elm.style.display).to.equal("");
    });
  });

  describe("api", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <h2 id="headline">Test</h2>
              <input type="button">
              <script>var a = 1;</script>
            </body>
          </html>`,
      });
    });

    elementApi.forEach((name) => {
      it(`"${name}" should be a function`, () => {
        const children = document.body.children;
        expect(children).to.have.length.above(0);
        for (const elm of children) {
          expect(elm, elm.tagName).to.have.property(name).and.be.a("function");
        }
      });
    });
  });

  describe("input[type=radio]", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <form>
                <input type="radio" name="test" value="1" checked="checked">
                <input type="radio" name="test" value="2">
              </form>
            </body>
          </html>`,
      });
    });

    it("has checked true if checked", () => {
      expect(document.getElementsByTagName("input")[0].checked).to.be.true;
    });

    it("has checked false if not checked", () => {
      expect(document.getElementsByTagName("input")[1].checked).to.be.false;
    });

    it("has value", () => {
      expect(document.getElementsByTagName("input")[0].value).to.equal("1");
      expect(document.getElementsByTagName("input")[1].value).to.equal("2");
    });

    it("has type", () => {
      expect(document.getElementsByTagName("input")[0].type).to.equal("radio");
      expect(document.getElementsByTagName("input")[1].type).to.equal("radio");
    });

    it("can set checked", () => {
      const elm = document.getElementsByTagName("input")[1];
      elm.checked = true;
      expect(elm.checked).to.be.true;
    });

    it("unsets checked on siblings", () => {
      const elms = document.getElementsByTagName("input");
      elms[1].checked = true;
      expect(elms[0].checked).to.be.false;
    });

    it("sets checked if clicked", () => {
      const elm = document.getElementsByTagName("input")[1];
      elm.click();

      expect(elm.checked).to.be.true;
    });

    it("does not emit change when checked", () => {
      const elm = document.getElementsByTagName("input")[1];
      let eventFired = false;
      elm.addEventListener("change", () => {
        eventFired = true;
      });
      elm.checked = true;

      expect(eventFired).to.be.false;
    });

    it("emits change if clicked", (done) => {
      const elm = document.getElementsByTagName("input")[1];
      elm.addEventListener("change", () => done());
      elm.click();
    });

    it("does NOT emit change if clicked again", () => {
      const elm = document.getElementsByTagName("input")[1];
      let changed = 0;
      elm.addEventListener("change", () => changed++);
      elm.click();
      elm.click();

      expect(changed).to.equal(1);
    });

    it("emits change on form if clicked", (done) => {
      const form = document.getElementsByTagName("form")[0];
      const elm = document.getElementsByTagName("input")[1];
      form.addEventListener("change", () => done());
      elm.click();
    });

    it("unsets checked on siblings in same form", () => {
      document = new Document({
        text: `
          <html>
            <body>
              <form id="form1">
                <input type="radio" name="test" value="1" checked="checked">
                <input type="radio" name="test" value="2">
              </form>
              <form id="form2">
                <input type="radio" name="test" value="1" checked="checked">
                <input type="radio" name="test" value="2">
              </form>
            </body>
          </html>`,
      });

      const elms1 = document.getElementById("form1").getElementsByTagName("input");
      elms1[1].checked = true;
      expect(elms1[0].checked).to.be.false;

      const elms2 = document.getElementById("form2").getElementsByTagName("input");
      expect(elms2[0].checked).to.be.true;
      expect(elms2[1].checked).to.be.false;
    });
  });

  describe("input[type=checkbox]", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <form>
                <input type="checkbox" name="test1" value="1" checked="checked">
                <input type="checkbox" name="test2" value="2">
              </form>
              <input type="checkbox" name="test3" value="3">
            </body>
          </html>`,
      });
    });

    it("has checked true if checked", () => {
      expect(document.getElementsByTagName("input")[0].checked).to.be.true;
    });

    it("has checked false if not checked", () => {
      expect(document.getElementsByTagName("input")[1].checked).to.be.false;
    });

    it("has value", () => {
      expect(document.getElementsByTagName("input")[0].value).to.equal("1");
      expect(document.getElementsByTagName("input")[1].value).to.equal("2");
    });

    it("has type", () => {
      expect(document.getElementsByTagName("input")[0].type).to.equal("checkbox");
      expect(document.getElementsByTagName("input")[1].type).to.equal("checkbox");
    });

    it("can set checked", () => {
      const elm = document.getElementsByTagName("input")[1];
      elm.checked = true;
      expect(elm.checked).to.be.true;
    });

    it("can set unchecked", () => {
      const elm = document.getElementsByTagName("input")[0];
      elm.checked = false;
      expect(elm.checked).to.be.false;
    });

    it("sets checked if clicked", () => {
      const elm = document.getElementsByTagName("input")[1];
      elm.click();

      expect(elm.checked).to.be.true;
    });

    it("does NOT emit change when checked", () => {
      const elm = document.getElementsByTagName("input")[1];
      let eventFired = false;
      elm.addEventListener("change", () => {
        eventFired = true;
      });
      elm.checked = true;

      expect(eventFired).to.be.false;
    });

    it("emits change if clicked multiple times", () => {
      const elm = document.getElementsByTagName("input")[1];
      let changed = 0;
      elm.addEventListener("change", () => changed++);
      elm.click();
      elm.click();

      expect(changed).to.equal(2);
    });

    it("emits change on form if clicked", (done) => {
      const form = document.getElementsByTagName("form")[0];
      const elm = document.getElementsByTagName("input")[1];
      form.addEventListener("change", () => done());
      elm.click();
    });

    it("emits change on input if clicked, even outside of form", (done) => {
      const elm = document.getElementsByTagName("input")[2];
      elm.addEventListener("change", () => done());
      elm.click();
    });
  });

  describe("details", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <details>
                <summary>Foo</summary>
                <p>Bar</p>
              </details>
              <details open>
                <summary>Foo</summary>
                <p>Bar</p>
              </details>
            </body>
          </html>`,
      });
    });

    it("has open false if not open", () => {
      const elm = document.getElementsByTagName("details")[0];
      expect(elm.open).to.be.false;
    });

    it("has open true if open", () => {
      const elm = document.getElementsByTagName("details")[1];
      expect(elm.open).to.be.true;
    });

    it("can set open", () => {
      const elm = document.getElementsByTagName("details")[0];
      elm.open = true;
      expect(elm.open).to.be.true;
    });

    it("can set not open", () => {
      const elm = document.getElementsByTagName("details")[1];
      elm.open = false;
      expect(elm.open).to.be.false;
    });

    it("toggles open if clicked on summary", () => {
      const elm = document.getElementsByTagName("summary")[0];
      elm.click();
      expect(elm.parentElement.open).to.be.true;
      elm.click();
      expect(elm.parentElement.open).to.be.false;
    });

    it("does not set open if clicked on details", () => {
      const elm = document.getElementsByTagName("details")[0];
      elm.click();

      expect(elm.open).to.be.false;
    });
  });

  describe("_setBoundingClientRect", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <h2>Test</h2>
              <p>Body text</p>
            </body>
          </html>`,
      });
    });

    it("sets result of getBoundingClientRect", () => {
      const [ elm ] = document.getElementsByTagName("p");
      elm._setBoundingClientRect({
        top: 10,
        bottom: 20,
        left: 10,
        right: 20,
      });

      expect(elm.getBoundingClientRect()).to.eql({
        top: 10,
        bottom: 20,
        height: 10,
        left: 10,
        right: 20,
        width: 10,
      });
    });

    it("sets height to 0 and sets bottom value to top value if there is only top", () => {
      const [ elm ] = document.getElementsByTagName("p");
      elm._setBoundingClientRect({ top: 10 });

      expect(elm.getBoundingClientRect()).to.eql({
        top: 10,
        left: 0,
        right: 0,
        width: 0,
        bottom: 10,
        height: 0,
      });
    });

    it("sets offsetHeight as well", () => {
      const [ elm ] = document.getElementsByTagName("p");
      elm._setBoundingClientRect({ top: 10, bottom: 200 });
      expect(elm.offsetHeight).to.equal(190);

      elm._setBoundingClientRect({ top: -300, bottom: 0 });
      expect(elm.offsetHeight).to.equal(300);
    });

    it("sets offsetWidth as well", () => {
      const [ elm ] = document.getElementsByTagName("p");
      elm._setBoundingClientRect({ left: 10, right: 200 });
      expect(elm.offsetWidth).to.equal(190);

      elm._setBoundingClientRect({ left: -300, right: 0 });
      expect(elm.offsetWidth).to.equal(300);
    });
  });

  describe(".textContent", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <h2>Test</h2>
              <script>var a = 1;</script>
            </body>
          </html>`,
      });
    });

    it("returns null on document", () => {
      expect(document).to.have.property("textContent", null);
    });

    it("returns text content of element", () => {
      expect(document.getElementsByTagName("h2")[0]).to.have.property("textContent", "Test");
    });

    it("sets text content of element", () => {
      const elm = document.getElementsByTagName("h2")[0];
      elm.textContent = "Modified test";
      expect(elm).to.have.property("textContent", "Modified test");
    });

    it("returns text content of script element", () => {
      expect(document.getElementsByTagName("script")[0]).to.have.property("textContent", "var a = 1;");
    });

    it("sets text content of script element", () => {
      const elm = document.getElementsByTagName("script")[0];
      elm.textContent = "var b = 2;";
      expect(elm).to.have.property("textContent", "var b = 2;");
    });

  });

  describe(".firstElementChild", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <h2>Test</h2>
              <p>
                Some <strong>string</strong> text
              </p>
            </body>
          </html>`,
      });
    });

    it("returns first element child", () => {
      expect(document.body.firstElementChild).to.have.property("tagName", "H2");
    });

    it("returns null if no element children", () => {
      expect(document.getElementsByTagName("h2")[0].firstElementChild).to.be.null;
    });

    it("ignores text content", () => {
      expect(document.getElementsByTagName("p")[0].firstElementChild).to.have.property("tagName", "STRONG");
    });
  });

  describe(".firstChild", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body><h2>Test</h2>
              <p>Some <strong>string</strong> text</p>
              <p class="empty"></p>
            </body>
          </html>`,
      });
    });

    it("returns first child", () => {
      expect(document.body.firstChild).to.have.property("tagName", "H2");
    });

    it("returns text content", () => {
      const firstChild = document.getElementsByTagName("p")[0].firstChild;
      expect(firstChild.textContent).to.equal("Some ");
      expect(firstChild.nodeType).to.equal(3);
    });

    it("returns null if no element children", () => {
      expect(document.getElementsByClassName("empty")[0].firstChild).to.be.null;
    });
  });

  describe(".lastElementChild", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <h2>Test</h2>
              <p>
                Some <strong>string</strong> <b>bold</b> text
              </p>
            </body>
          </html>`,
      });
    });

    it("returns last element child", () => {
      expect(document.body.lastElementChild).to.have.property("tagName", "P");
    });

    it("returns null if no element children", () => {
      expect(document.getElementsByTagName("h2")[0].lastElementChild).to.be.null;
    });

    it("ignores text content", () => {
      expect(document.getElementsByTagName("p")[0].lastElementChild).to.have.property("tagName", "B");
    });
  });

  describe(".lastChild", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <h2>Test <b>title</b></h2>
              <p>Some <strong>string</strong> <b>bold</b> text</p>
            <p class="empty"></p></body></html>`,
      });
    });

    it("returns last child", () => {
      expect(document.body.lastChild).to.have.property("tagName", "P");
    });

    it("returns text content", () => {
      const lastChild = document.getElementsByTagName("p")[0].lastChild;
      expect(lastChild.textContent).to.equal(" text");
      expect(lastChild.nodeType).to.equal(3);
    });

    it("returns element if last", () => {
      expect(document.getElementsByTagName("h2")[0].lastChild).to.have.property("tagName", "B");
    });

    it("returns null if no element children", () => {
      expect(document.getElementsByClassName("empty")[0].lastChild).to.be.null;
    });
  });

  describe(".contains", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
          <body>
            <div id="container">
              <h2>Test <b>title</b></h2>
              <p>Some <strong>string</strong> <b>bold</b> text</p>
              <p class="empty"></p>
            </div>
            <div id="outside"></div>
          </body></html>`,
      });
    });

    it("should be defined on body element", () => {
      expect(document.body.contains).to.exist;
    });

    it("should be defined on documentElement", () => {
      expect(document.documentElement.contains).to.exist;
    });

    it("returns true if direct child element found", () => {
      expect(document.documentElement.contains(document.body)).to.be.true;
    });

    it("returns true if child element found", () => {
      expect(document.documentElement.contains(document.getElementsByTagName("h2")[0])).to.be.true;
    });

    it("returns true if finding itself", () => {
      expect(document.documentElement.contains(document.documentElement)).to.be.true;
    });

    it("returns false if child element is a sibling", () => {
      expect(document.getElementById("container").contains(document.getElementById("outside"))).to.be.false;
    });

    it("returns false if element isn't a child element", () => {
      expect(document.body.contains(document.documentElement)).to.be.false;
    });
  });

  describe(".closest", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <div class="parent element">
                <span class="element"></span>
              </div>
            </body>
          </html>`,
      });
    });

    it("should get parent element", () => {
      const [ element ] = document.getElementsByTagName("span");
      const closest = element.closest(".parent");

      expect(closest).to.equal(document.getElementsByClassName("parent")[0]);
    });

    it("should get itself", () => {
      const [ element ] = document.getElementsByTagName("span");
      const closest = element.closest(".element");

      expect(closest).to.equal(element);
    });
  });

  describe(".className", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html class="no-js">
            <body>
              <h2 id="h" class="header">Test <b>title</b></h2>
            </body>
          </html>`,
      });
    });

    it("returns class attribute", () => {
      expect(document.getElementById("h").className).to.equal("header");
    });

    it("sets class attribute", () => {
      document.body.className = "hidden no-js";
      expect(document.body.className).to.equal("hidden no-js");
    });
  });

  describe(".scrollWidth", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <div id="element">
                <div class="child"></div>
                <div class="child"></div>
                <div class="child"></div>
              </div>
            </body>
          </html>`,
      });

      const children = document.getElementsByClassName("child");
      for (let i = 0; i < children.length; ++i) {
        const el = children[i];
        el._setBoundingClientRect({
          left: 100 * i,
          right: 100 * (i + 1),
        });
      }
    });

    it("should return the correct value", () => {
      expect(document.getElementById("element").scrollWidth).to.equal(300);
    });
  });

  describe(".scrollHeight", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <div id="element">
                <div class="child"></div>
                <div class="child"></div>
                <div class="child"></div>
              </div>
            </body>
          </html>`,
      });

      const children = document.getElementsByClassName("child");
      for (let i = 0; i < children.length; ++i) {
        const el = children[i];
        el._setBoundingClientRect({
          top: 100 * i,
          bottom: 100 * (i + 1),
        });
      }
    });

    it("should return the correct value", () => {
      expect(document.getElementById("element").scrollHeight).to.equal(300);
    });
  });

  describe(".outerHTML", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <span data-json="{&quot;var&quot;:1}">åäö</span>
            </body>
          </html>`,
      });
    });

    it("should return the expected markup", () => {
      const [ elm ] = document.getElementsByTagName("span");
      expect(elm.outerHTML).to.equal("<span data-json=\"{\"var\":1}\">åäö</span>");
    });
  });

  describe(".innerText", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <span>åäö</span>
            </body>
          </html>`,
      });
    });

    it("get returns text content", () => {
      const [ elm ] = document.getElementsByTagName("span");
      expect(elm.innerText).to.equal("åäö");
    });

    it("set replaces content should insert child", () => {
      const [ elm ] = document.getElementsByTagName("span");
      elm.innerText = "ÖÄÅ";
      expect(elm.innerText).to.equal("ÖÄÅ");
    });
  });

  describe(".cloneNode", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <div class="block">
                <!-- Comment node -->
                Child text node
                <span>Child element node</span>
              </div>
            </body>
          </html>`,
      });
    });

    it("returns an empty clone of itself", () => {
      const elm = document.getElementsByClassName("block")[0];
      const elmClone = elm.cloneNode();
      expect(elmClone.outerHTML).to.equal("<div class=\"block\"></div>");
      expect(elmClone === elm).to.be.false;
    });

    it("returns an clone of itself and its content when deeply cloned", () => {
      const elm = document.getElementsByClassName("block")[0];
      const elmClone = elm.cloneNode(true);
      expect(elmClone.outerHTML).to.equal(elm.outerHTML);
      expect(elmClone === elm).to.be.false;

      const elmChild = elm.getElementsByTagName("span")[0];
      expect(elmChild).to.be.ok;
      const elmCloneChild = elmClone.getElementsByTagName("span")[0];
      expect(elmCloneChild).to.be.ok;

      expect(elmCloneChild === elmChild).to.be.false;
    });

    it("returns a clone without event listerners", () => {
      const elm = document.getElementsByClassName("block")[0];
      let clicked = false;
      elm.addEventListener("click", () => (clicked = true));
      const elmClone = elm.cloneNode(true);
      elmClone.click();
      expect(clicked).to.be.false;
    });
  });

  describe("video element", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <h2>Test <b>title</b></h2>
              <video id="video-element"></video>
            </body>
          </html>`,
      });
    });

    it("has a play method", () => {
      const videoElement = document.getElementById("video-element");
      expect(typeof videoElement.play === "function").to.be.true;
    });

    it("the play method returns a resolved promise", (done) => {
      const videoElement = document.getElementById("video-element");
      const returnValue = videoElement.play();
      expect(returnValue instanceof Promise).to.be.true;
      returnValue.then((value) => {
        expect(value).to.be.undefined;
        done();
      });
    });

    it("has a pause method", () => {
      const videoElement = document.getElementById("video-element");
      expect(typeof videoElement.pause === "function").to.be.true;
    });

    it("has a load method", () => {
      const videoElement = document.getElementById("video-element");
      expect(typeof videoElement.load === "function").to.be.true;
    });

    it("the pause method returns undefined", () => {
      const videoElement = document.getElementById("video-element");
      const returnValue = videoElement.pause();
      expect(returnValue).to.be.undefined;
    });

    it("has a canPlayType function", () => {
      const videoElement = document.getElementById("video-element");
      expect(videoElement.canPlayType).to.be.a("function");
    });

    it("canPlayType function returns maybe", () => {
      const videoElement = document.getElementById("video-element");
      expect(videoElement.canPlayType("application/mp4")).to.be.equal("maybe");
    });
  });

  describe("audio element", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <h2>Test <b>title</b></h2>
              <audio id="audio-element"></audio>
            </body>
          </html>`,
      });
    });

    it("has the expected properties", () => {
      const audioElement = document.getElementById("audio-element");
      expect(audioElement).to.have.property("paused", true);
      expect(audioElement).to.have.property("duration", 0);
      expect(audioElement).to.have.property("currentTime", 0);
      expect(audioElement).to.have.property("volume", 1);
    });

    it("has a play method", () => {
      const audioElement = document.getElementById("audio-element");
      expect(typeof audioElement.play === "function").to.be.true;
    });

    it("the play method sets paused to false and returns a resolved promise", (done) => {
      const audioElement = document.getElementById("audio-element");
      const returnValue = audioElement.play();
      expect(audioElement).to.have.property("paused", false);
      expect(returnValue instanceof Promise).to.be.true;
      returnValue.then((value) => {
        expect(value).to.be.undefined;
        done();
      });
    });

    it("has a pause method", () => {
      const audioElement = document.getElementById("audio-element");
      expect(typeof audioElement.pause === "function").to.be.true;
    });

    it("the pause method sets paused to true and returns undefined", () => {
      const audioElement = document.getElementById("audio-element");
      const returnValue = audioElement.pause();
      expect(audioElement).to.have.property("paused", true);
      expect(returnValue).to.be.undefined;
    });

    it("has a load method", () => {
      const audioElement = document.getElementById("audio-element");
      expect(typeof audioElement.load === "function").to.be.true;
    });

    it("the load method returns undefined", () => {
      const audioElement = document.getElementById("audio-element");
      const returnValue = audioElement.load();
      expect(returnValue).to.be.undefined;
    });

    it("has a _setDuration method", () => {
      const audioElement = document.getElementById("audio-element");
      expect(typeof audioElement._setDuration === "function").to.be.true;
    });

    it("the _setDuration method sets the duration in seconds", () => {
      const audioElement = document.getElementById("audio-element");
      audioElement._setDuration(50);
      expect(audioElement).to.have.property("duration", 50);
    });

  });

  describe("template element", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <h1>Template</h1>
              <template><h2>Test <b>title</b></h2></template>
            </body>
          </html>`,
      });
    });

    it("has content property that is a DocumentFragment", () => {
      const [ element ] = document.getElementsByTagName("template");
      expect(element.content).to.be.instanceof(DocumentFragment);
    });

    it("non-template element returns undefined", () => {
      const [ element ] = document.getElementsByTagName("h1");
      expect(element.content).to.be.undefined;
    });
  });

  describe("instanceof", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <h2>Test <b>title</b></h2>
              <form id="get-form" type="get" action="/">
                <button type="submit">Submit</submit>
              </form>
            </body>
          </html>`,
      });
    });

    it("instance has an instanceof Element", () => {
      const element = document.getElementById("get-form");
      expect(element).to.be.instanceof(Element);
    });

    it("form instance has an instanceof Form", () => {
      const element = document.getElementById("get-form");
      expect(element).to.be.instanceof(HTMLFormElement);
    });
  });

  describe("previous- and nextElementSibling", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <div class="previous-element"></div>
              text
              <div class="start-element"></div>
              text
              <div class="next-element"></div>
            </body>
          </html>`,
      });
    });

    it("should get the previous element sibling", () => {
      const elm = document.getElementsByClassName("start-element")[0];
      expect(elm.previousElementSibling.classList.contains("previous-element")).to.be.true;
    });

    it("should return null if no previous sibling", () => {
      const elm = document.getElementsByClassName("previous-element")[0];
      expect(elm.previousElementSibling).to.equal(undefined);
    });

    it("should get the next element sibling", () => {
      const elm = document.getElementsByClassName("start-element")[0];
      expect(elm.nextElementSibling.classList.contains("next-element")).to.be.true;
    });

    it("should return null if no next sibling", () => {
      const elm = document.getElementsByClassName("next-element")[0];
      expect(elm.nextElementSibling).to.equal(undefined);
    });
  });

  describe("insertBefore", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <div class="element-10"></div>
              text1
              <div class="element-20"></div>
              text2
            </body>
          </html>`,
      });
    });

    it("should insert node before reference node", () => {
      const parentElm = document.getElementsByTagName("body")[0];
      const beforeElm = document.getElementsByClassName("element-20")[0];

      const newNode = document.createElement("div");
      newNode.classList.add("element-15");

      const returnValue = parentElm.insertBefore(newNode, beforeElm);

      const divs = parentElm.getElementsByTagName("div");
      expect(divs.length).to.equal(3);
      expect(divs[1].classList.contains("element-15")).to.be.true;
      expect(returnValue).to.eql(newNode);
    });

    it("should insert node as last child of parent when referenceNode is null", () => {
      const parentElm = document.getElementsByTagName("body")[0];

      const newNode = document.createElement("div");
      newNode.classList.add("element-30");

      const returnValue = parentElm.insertBefore(newNode, null);

      const divs = parentElm.getElementsByTagName("div");
      expect(divs.length).to.equal(3);
      expect(divs[2].classList.contains("element-30")).to.be.true;
      expect(returnValue).to.eql(newNode);
    });

    it("should throw DOMException when referenceNode is not child of target", () => {
      const parentElm = document.getElementsByClassName("element-10")[0];
      const beforeElm = document.getElementsByClassName("element-20")[0];

      const newNode = document.createElement("div");
      newNode.classList.add("element-15");

      expect(() => {
        parentElm.insertBefore(newNode, beforeElm);
      }).to.throw(DOMException);

      const divs = document.getElementsByTagName("body")[0].getElementsByTagName("div");
      expect(divs.length).to.equal(2);
    });

    it("should move existing nodes", () => {
      const parentElm = document.getElementsByTagName("body")[0];
      const beforeElm = document.getElementsByClassName("element-10")[0];
      const moveElm = document.getElementsByClassName("element-20")[0];

      const returnValue = parentElm.insertBefore(moveElm, beforeElm);

      const divs = parentElm.getElementsByTagName("div");
      expect(divs.length).to.equal(2);
      expect(divs[0].classList.contains("element-20")).to.be.true;
      expect(divs[1].classList.contains("element-10")).to.be.true;
      expect(returnValue).to.eql(moveElm);
    });

    it("should handle text nodes", () => {
      const parentElm = document.getElementsByTagName("body")[0];
      const beforeElm = document.getElementsByClassName("element-20")[0];

      const newNode = document.createTextNode("Tordyveln flyger i skymningen");

      const returnValue = parentElm.insertBefore(newNode, beforeElm);

      const text = parentElm.textContent.replace(/\s/g, "");
      expect(text).to.equal("text1Tordyvelnflygeriskymningentext2");
      expect(returnValue).to.eql(newNode);
    });
  });

  describe("insertAdjacentHTML", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <div class="div-1"></div>
            </body>
          </html>`,
      });
    });

    it("should insert adjacent html before the element", () => {
      const targetElement = document.getElementsByClassName("div-1")[0];
      targetElement.insertAdjacentHTML("beforebegin", "<p class='p-1'>Blahonga</p>");

      expect(targetElement.previousElementSibling.classList.contains("p-1")).to.be.true;
    });

    it("should insert adjacent html inside element before first child", () => {
      document.body.insertAdjacentHTML("afterbegin", "<p class='p-1'>Blahonga</p>");
      const el = document.body.getElementsByClassName("p-1")[0];

      expect(el.parentElement === document.body).to.equal(true);
      expect(el.previousElementSibling).to.be.undefined;
      expect(el.nextElementSibling === document.getElementsByClassName("div-1")[0]).to.equal(true);
    });

    it("should insert adjacent html inside element after last child", () => {
      document.body.insertAdjacentHTML("beforeend", "<p class='p-1'>Blahonga</p>");
      const el = document.body.getElementsByClassName("p-1")[0];

      expect(el.parentElement === document.body).to.equal(true);
      expect(el.previousElementSibling === document.getElementsByClassName("div-1")[0]).to.equal(true);
      expect(el.nextElementSibling).to.be.undefined;
    });

    it("should insert adjacent html after the element", () => {
      const targetElement = document.getElementsByClassName("div-1")[0];
      targetElement.insertAdjacentHTML("afterend", "<p class='p-1'>Blahonga</p>");

      expect(targetElement.nextElementSibling.classList.contains("p-1")).to.be.true;
    });

    it("should insert adjacent html with encoded content", () => {
      document.body.insertAdjacentHTML("beforeend", "<span data-json=\"{&quot;var&quot;:1}\">&#xE5;&#xE4;&#xF6;</span>");
      const el = document.body.getElementsByTagName("span")[0];

      expect(el.parentElement === document.body).to.equal(true);

      expect(el.textContent).to.equal("åäö");
      expect(el.dataset.json).to.equal("{\"var\":1}");
    });

    it("should be case insensitive", () => {
      const targetElement = document.getElementsByClassName("div-1")[0];
      targetElement.insertAdjacentHTML("bEfOreBeGiN", "<p class='p-1'>Blahonga</p>");

      expect(targetElement.previousElementSibling.classList.contains("p-1")).to.be.true;
    });

    it("should throw if the position is wrong", () => {
      const targetElement = document.getElementsByClassName("div-1")[0];
      expect(() => {
        targetElement.insertAdjacentHTML("wrong", "<p></p>");
      }).to.throw(DOMException);
    });
  });

  describe("insertAdjacentElement", () => {
    let document, elementToInsert;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <div class="div-1"></div>
            </body>
          </html>`,
      });
      elementToInsert = document.createElement("p");
      elementToInsert.className = "p-1";
    });

    it("should insert adjacent element before the target element", () => {
      const targetElement = document.getElementsByClassName("div-1")[0];
      targetElement.insertAdjacentElement("beforebegin", elementToInsert);

      expect(targetElement.previousElementSibling.classList.contains("p-1")).to.be.true;
    });

    it("should insert adjacent element inside target element before first child", () => {
      document.body.insertAdjacentElement("afterbegin", elementToInsert);
      const el = document.body.getElementsByClassName("p-1")[0];

      expect(el.parentElement === document.body).to.equal(true);
      expect(el.previousElementSibling).to.be.undefined;
      expect(el.nextElementSibling === document.getElementsByClassName("div-1")[0]).to.equal(true);
    });

    it("should insert adjacent element inside target element after last child", () => {
      document.body.insertAdjacentElement("beforeend", elementToInsert);
      const el = document.body.getElementsByClassName("p-1")[0];

      expect(el.parentElement === document.body).to.equal(true);
      expect(el.previousElementSibling === document.getElementsByClassName("div-1")[0]).to.equal(true);
      expect(el.nextElementSibling).to.be.undefined;
    });

    it("should insert adjacent element after the target element", () => {
      const targetElement = document.getElementsByClassName("div-1")[0];
      targetElement.insertAdjacentElement("afterend", elementToInsert);

      expect(targetElement.nextElementSibling.classList.contains("p-1")).to.be.true;
    });

    it("should throw if the position is wrong", () => {
      const targetElement = document.getElementsByClassName("div-1")[0];
      expect(() => {
        targetElement.insertAdjacentElement("wrong", elementToInsert);
      }).to.throw(DOMException);
    });

    it("should return the inserted element", () => {
      const targetElement = document.getElementsByClassName("div-1")[0];
      const returnedElement = targetElement.insertAdjacentElement("beforebegin", elementToInsert);
      expect(returnedElement === elementToInsert, "same instance").to.be.true;
      returnedElement.insertAdjacentElement("beforebegin", document.createElement("dialog"));
      expect(document.getElementsByTagName("dialog").length).to.equal(1);
    });
  });

  describe("matches", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body class="parent-element">
              <div class="element" data-attr="value"></div>
            </body>
          </html>
          `,
      });
    });

    it("should return true is element matches selector", () => {
      const element = document.getElementsByClassName("element")[0];
      expect(element.matches(".element")).to.be.true;
    });

    it("should return true is element matches more complex selector", () => {
      const element = document.getElementsByClassName("element")[0];
      expect(element.matches(".parent-element div.element[data-attr=value]:first-child")).to.be.true;
    });

    it("should return false is element doesn't match selector", () => {
      const element = document.getElementsByClassName("element")[0];
      expect(element.matches(".random-element")).to.be.false;
    });

    it("should throw DOMException when passed an invalid selector", () => {
      const element = document.getElementsByClassName("element")[0];

      expect(() => {
        element.matches("$invalid");
      }).to.throw(DOMException).with.property("code", 12);
    });
  });

  describe("Event listeners", () => {
    let buttons;
    let clickCount;
    let document;
    beforeEach(() => {
      document = new Document({
        text: `<html>
            <body>
              <div>
                <button id="button-1" type="button"></button>
                <button id="button-2" type="button"></button>
                <button id="button-3" type="button" disabled="disabled"></button>
              </div>
            </body>
          </html>`,
      });
      buttons = document.getElementsByTagName("button");
      clickCount = 0;
    });

    it("listens to focus event", () => {
      let focusCount = 0;
      buttons[0].addEventListener("focus", () => {
        ++focusCount;
      });
      buttons[0].focus();
      expect(focusCount).to.equal(1);
      expect(document.activeElement).to.equal(buttons[0]);
    });

    it("listens to blur event", () => {
      let blurCount = 0;
      buttons[0].addEventListener("blur", () => {
        ++blurCount;
      });
      buttons[0].blur();
      expect(blurCount).to.equal(1);
      expect(document.activeElement).to.equal(document.body);
    });

    it("when blurred receives relatedTarget", () => {
      let blurCount = 0;
      buttons[0].addEventListener("blur", (e) => {
        expect(e.relatedTarget === buttons[1]);
        ++blurCount;
      });
      buttons[0].focus();
      buttons[1].click();
      expect(blurCount).to.equal(1);
    });

    it("does not trigger focus event when the element is disabled", () => {
      let focusCount = 0;
      buttons[2].addEventListener("focus", () => {
        ++focusCount;
      });
      buttons[2].focus();
      expect(focusCount).to.equal(0);
    });

    it("listens to click event", () => {
      buttons[0].addEventListener("click", increment);

      buttons[0].click();
      expect(clickCount).to.equal(1);

      buttons[0].click();
      expect(clickCount).to.equal(2);

      buttons[0].removeEventListener("click", increment);
      buttons[0].click();
      expect(clickCount).to.equal(2);
    });

    it("listens to click event once", () => {
      buttons[0].addEventListener("click", increment, { once: true });

      buttons[0].click();
      expect(clickCount).to.equal(1);

      buttons[0].click();
      expect(clickCount).to.equal(1);
    });

    it("does not fire event when the element is disabled", () => {
      buttons[2].addEventListener("click", increment);
      buttons[2].click();

      expect(clickCount).to.equal(0);
    });

    it("can invoke click event listeners with element as this", () => {
      buttons[0].addEventListener("click", increment);
      buttons[1].addEventListener("click", increment);

      buttons[0].click();
      buttons[0].click();
      buttons[1].click();

      expect(clickCount).to.equal(3);
      expect(buttons[0].clickCount).to.equal(2);
      expect(buttons[1].clickCount).to.equal(1);
    });

    it("should propagate click to parent", () => {
      let result = 0;
      document.body.addEventListener("click", () => {
        result++;
      });

      buttons[0].click();

      expect(result).to.equal(1);
    });

    it("should bubble event up to document if bubbles is enabled", () => {
      const bubbled = [];
      document.addEventListener("columbus", () => {
        bubbled.push("document");
      });

      expect(document.firstElementChild.tagName).to.equal("HTML");
      document.firstElementChild.addEventListener("columbus", () => {
        bubbled.push("html");
      });

      document.body.addEventListener("columbus", () => {
        bubbled.push("body");
      });

      document.getElementsByTagName("div")[0].addEventListener("columbus", () => {
        bubbled.push("div");
      });

      for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("columbus", () => {
          bubbled.push("button");
        });
      }

      buttons[2].dispatchEvent(new Event("columbus", { bubbles: true }));

      expect(bubbled).to.eql([ "button", "div", "body", "html", "document" ]);
    });

    it("should NOT bubble event if bubbles is disabled (default)", () => {
      const bubbled = [];
      document.body.addEventListener("wichita", () => {
        bubbled.push("body");
      });

      document.getElementsByTagName("div")[0].addEventListener("wichita", () => {
        bubbled.push("div");
      });

      for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("wichita", () => {
          bubbled.push("button");
        });
      }

      buttons[2].dispatchEvent(new Event("wichita"));

      expect(bubbled).to.eql([ "button" ]);
    });

    it("should NOT propagate click to parent when propagation stopped", () => {
      let result = false;
      document.body.addEventListener("click", () => {
        result = true;
      });

      buttons[0].addEventListener("click", (e) => {
        e.stopPropagation();
      });

      buttons[0].click();

      expect(result).to.equal(false);
    });

    describe("listener is 'identical' based on eventName, callback and useCapture", () => {
      it("disregards multiple 'identical' event listeners", () => {
        buttons[0].addEventListener("click", increment);
        buttons[0].addEventListener("click", increment, false);
        buttons[0].addEventListener("click", increment, { capture: false });
        buttons[0].addEventListener("click", increment, { passive: true });

        buttons[0].addEventListener("click", increment, true);
        buttons[0].addEventListener("click", increment, { capture: true });

        buttons[0].click();
        expect(clickCount).to.equal(2);

        buttons[0].removeEventListener("click", increment);
        buttons[0].click();
        expect(clickCount).to.equal(3);

        buttons[0].removeEventListener("click", increment, true);
        buttons[0].click();
        expect(clickCount).to.equal(3);
      });

      it("multiple listeners with different once option", () => {
        buttons[0].addEventListener("click", increment, { once: false });
        buttons[0].addEventListener("click", increment, { once: true }); // won't be once

        buttons[1].addEventListener("click", increment, { once: true });
        buttons[1].addEventListener("click", increment, { once: false }); // will be once

        buttons[0].click();
        buttons[0].click();
        expect(clickCount).to.equal(2);

        buttons[1].click();
        buttons[1].click();
        expect(clickCount).to.equal(3);

        buttons[0].removeEventListener("click", increment);
        buttons[1].removeEventListener("click", increment);

        buttons[0].click();
        buttons[1].click();
        expect(clickCount).to.equal(3);
      });
    });

    function increment() {
      ++clickCount;
      this.clickCount = !this.clickCount ? 1 : this.clickCount + 1;
    }
  });

  describe("requestFullscreen", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <div class="element-10"></div>
              text1
              <div class="element-20"></div>
              text2
            </body>
          </html>`,
      });
    });

    it("should set document.fullscreenElement to element", () => {
      const element10 = document.getElementsByClassName("element-10")[0];
      element10.requestFullscreen();

      expect(document.fullscreenElement).to.eql(element10);
    });
  });

  describe("scrollLeft", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <div class="element">
                <div></div>
              </div>
            </body>
          </html>`,
      });
      const element = document.getElementsByClassName("element")[0];
      element._setBoundingClientRect({
        left: 0,
        right: 100,
      });

      element.firstElementChild._setBoundingClientRect({
        left: 0,
        right: 200,
      });
    });

    it("should get element x-axis scroll value", () => {
      const element = document.getElementsByClassName("element")[0];

      expect(element.scrollLeft).to.equal(0);
    });

    it("should set element x-axis scroll value", () => {
      const element = document.getElementsByClassName("element")[0];
      element.scrollLeft = 10;

      expect(element.scrollLeft).to.equal(10);
    });

    it("should affect other elements inside", () => {
      const element = document.getElementsByClassName("element")[0];
      const child = element.firstElementChild;
      element.setElementsToScroll(() => [ child ]);
      element.scrollLeft = 10;

      expect(child.getBoundingClientRect().left).to.equal(-10);
    });

    it("should clamp value to min scroll left", () => {
      const element = document.getElementsByClassName("element")[0];
      element.scrollLeft = -99999;

      expect(element.scrollLeft).to.equal(0);
    });

    it("should clamp value to max scroll left", () => {
      const element = document.getElementsByClassName("element")[0];
      element.scrollLeft = 99999;

      expect(element.scrollLeft).to.equal(100);
    });
  });

  describe("scrollTop", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <div class="element">
                <div></div>
              </div>
            </body>
          </html>`,
      });
      const element = document.getElementsByClassName("element")[0];
      element._setBoundingClientRect({
        top: 0,
        bottom: 100,
      });

      element.firstElementChild._setBoundingClientRect({
        top: 0,
        bottom: 200,
      });
    });

    it("should get element y-axis scroll value", () => {
      const element = document.getElementsByClassName("element")[0];

      expect(element.scrollTop).to.equal(0);
    });

    it("should set element y-axis scroll value", () => {
      const element = document.getElementsByClassName("element")[0];
      element.scrollTop = 10;

      expect(element.scrollTop).to.equal(10);
    });

    it("should affect other elements inside", () => {
      const element = document.getElementsByClassName("element")[0];
      const child = element.firstElementChild;
      element.setElementsToScroll(() => [ child ]);
      element.scrollTop = 10;

      expect(child.getBoundingClientRect().top).to.equal(-10);
    });

    it("should clamp value to min scroll top", () => {
      const element = document.getElementsByClassName("element")[0];
      element.scrollTop = -99999;

      expect(element.scrollTop).to.equal(0);
    });

    it("should clamp value to max scroll top", () => {
      const element = document.getElementsByClassName("element")[0];
      element.scrollTop = 99999;

      expect(element.scrollTop).to.equal(100);
    });
  });

  describe("element attributes when creating and appending dynamically", () => {
    let document;
    let element;
    const clickListener = () => {};

    before(() => {
      document = new Document({
        text: `
          <html>
            <body>
            </body>
          </html>`,
      });
      element = document.createElement("div");
      element.addEventListener("click", clickListener);
      document.body.appendChild(element);
    });

    it("keeps the click listener registered before appending to DOM", () => {
      const elm = document.getElementsByTagName("div")[0];

      expect(elm).to.deep.equal(element);
    });
  });
});
